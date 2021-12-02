import {Document, Ruleset, RulesetDefinition, Spectral} from "@stoplight/spectral-core"
import {FileRuleDefinition} from "@stoplight/spectral-core/dist/ruleset/types"
import {Json, Yaml} from "@stoplight/spectral-parsers"
import {asyncapi, oas} from "@stoplight/spectral-rulesets"
import {Codacyrc, Engine, ToolResult} from "codacy-seed"
import {readFile} from "codacy-seed"
import {parseSpecification, readJsonFile} from "codacy-seed/dist/src/fileUtils";
import * as fs from "fs"
import * as path from 'path';

import {extractFilesFromCodacyrc, extractPatternsFromCodacyrc} from "./configExtractor"
import {convertResults} from "./convertResults"
import {debug, debugEach} from "./logging";
import {getRulesetFromFile} from "./spectralRulesetLoader"
import {supportedConfigFiles} from "./toolMetadata"

export const engineImpl: Engine = async function (
    codacyrc?: Codacyrc
): Promise<ToolResult[]> {
    const specification = await readJsonFile("/docs/patterns.json")
        .then(f => parseSpecification(f!))

    const filesToProcess = await extractFilesFromCodacyrc(codacyrc)
    const patternsToApply = await extractPatternsFromCodacyrc(codacyrc)

    debug(`files to process: ${filesToProcess.length}`)
    debugEach(filesToProcess, file => `  file: ${file}`)

    debug(`patterns to process: ${patternsToApply?.length}`)
    debugEach(patternsToApply, pattern => `  pattern: ${pattern}`)

    let spectral: Spectral

    // we only try to initialize spectral with user custom configuration
    // when no patterns are defined in the codacyrc
    if (patternsToApply) {
        spectral = createSpectralWithCodacyRules(patternsToApply)
    } else {
        // looking for a user config file, which may not exist...
        const existsConfFile = await checkExistsConfFile()

        if (existsConfFile) {
            debug("trying to initialize spectral with given configuration...")

            // try to create a spectral for the configuration.
            // in case we fail, fallback to create a spectral with our defaults.

            const maybeSpectral = await createSpectralWithConfFile(existsConfFile)
                .catch(e => {
                    debug(`some error occurred loading conf file: ${e}`)

                    return (e instanceof Error)
                        ? e.message
                        : "unknown error"
                })

            if (maybeSpectral && typeof maybeSpectral != "string") {
                spectral = maybeSpectral
            } else {
                debug("couldn't create spectral with configuration...")

                const someError = maybeSpectral
                throw new Error(
                    someError
                        ? `A configuration file was found but an error occurred trying to load it:\n${someError}`
                        : "A configuration file was found but an error occurred trying to load it."
                )
            }
        } else {
            spectral = createSpectralWithCodacyRules([])
        }
    }

    const files = await Promise.all(
        filesToProcess.map(async (file) => {
            const fileContent = await readFile(file)
            return [file, fileContent.toString()]
        }) || []
    )

    const spectralResults = await Promise.all(
        files.map((file) => {
            const filename = file[0]
            const content = file[1]
            const extension = file[0].substring(filename.lastIndexOf('.') + 1, filename.length) || filename

            const document = extension === "json"
                ? new Document(content, Json, filename)
                : new Document(content, Yaml, filename)

            return spectral.run(document, {
                ignoreUnknownFormat: true,
            })
        }).flat()
    )

    // ensure the output only exposes rules that we know as defined in our specification
    const knownPatternIds =
        new Set(specification.patterns.map(pattern => pattern.patternId))

    const results = convertResults(
        spectralResults.flat()
    ).filter(issue => {
        return knownPatternIds.has(issue.patternId)
    })

    return results

    // configure spectral to use our rules only.
    function createSpectralWithCodacyRules(rulesToApply: (keyof Ruleset['rules'])[]): Spectral {
        debug("initializing spectral with codacy rules...")

        const s = new Spectral()

        //   configuring spectral to load our default rulesets
        //   and turn on only the recommended rules,
        // OR
        //   configure to load the default rulesets but with all
        //   rules not loaded and then explicitly turn on only the
        //   ones given in function parameters.
        if (!rulesToApply.length) {
            debug("configuring spectral to use all recommended rules...")

            s.setRuleset({
                extends: [
                    [asyncapi as RulesetDefinition, 'recommended'],
                    [oas as RulesetDefinition, 'recommended'],
                ]
            })
        } else {
            debug("configuring spectral to use explicit rules defined in codacyrc...")

            s.setRuleset({
                extends: [
                    [asyncapi as RulesetDefinition, 'off'],
                    [oas as RulesetDefinition, 'off'],
                ],
                rules: rulesToApply.reduce((obj: Record<string, Readonly<FileRuleDefinition>>, name: string) => {
                    obj[name] = true
                    return obj
                }, {}),
            })
        }

        debug("rules [ENABLED]:")
        debugEach(Object.values(s.ruleset!.rules), rule => `  ${rule.name} - ${rule.enabled}`)

        return s
    }

    // configure spectral to use the user defined spectral file.
    async function createSpectralWithConfFile(confFile: string): Promise<Spectral | undefined> {
        return getRulesetFromFile(confFile)
            .then(ruleset => {
                if (ruleset) {
                    const s = new Spectral()
                    s.setRuleset(ruleset)
                    return s
                } else {
                    return undefined
                }
            })
    }

    // looks for one of the default files the tool supports in the user files
    async function checkExistsConfFile(): Promise<string | undefined> {
        async function fileExists(name: string) {
            return fs.promises
                .stat(name).then(s => s.isFile()).catch(_ => false)
        }

        debug(`[conf] supported files: ${supportedConfigFiles}`)

        // we look for the first file that exists in our array of supported files
        for (const supportedFile of supportedConfigFiles) {
            debug(`[conf] looking for: ${supportedFile}`)

            if (await fileExists(supportedFile)) {
                debug(`[conf] found the following: ${supportedFile}`)

                // exposing the detected file name with its absolute path
                return path.join(process.cwd(), supportedFile)
            }
        }

        debug("[conf] couldn't find any of the configuration supported files")

        return undefined
    }
}
