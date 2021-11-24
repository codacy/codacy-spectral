import {Document, Ruleset, RulesetDefinition, Spectral} from "@stoplight/spectral-core"
import {FileRuleDefinition} from "@stoplight/spectral-core/dist/ruleset/types"
import {Json, Yaml} from "@stoplight/spectral-parsers"
import {asyncapi, oas} from "@stoplight/spectral-rulesets"
import {Codacyrc, Engine, ToolResult} from "codacy-seed"
import {readFile} from "codacy-seed"
import * as fs from "fs"

import {extractFiles, extractPatternIdsToApply} from "./configExtractor"
import {convertResults} from "./convertResults"
import {getRulesetFromFile} from "./spectralRulesetLoader"
import {supportedConfigFiles} from "./toolMetadata"

export const engineImpl: Engine = async function (
    codacyrc?: Codacyrc
): Promise<ToolResult[]> {

    const filesToProcess = await extractFiles(codacyrc)
    const patternIdsToApply = await extractPatternIdsToApply(codacyrc)

    console.debug(`files to process: ${filesToProcess.length}`)
    filesToProcess.forEach(file =>
        console.debug(`  file: ${file}`)
    )

    console.debug(`patterns to process: ${patternIdsToApply?.length}`)
    patternIdsToApply?.forEach(patt =>
        console.debug(`  file: ${patt}`)
    )

    const [existsConfFile, file] = await checkExistsDefaultConfFile()

    let spectral: Spectral

    if (existsConfFile) {
        console.debug("trying to initialize spectral with given configuration...")

        // try to create a spectral for the configuration.
        // in case we fail, fallback to create a spectral with our defaults.

        const maybeSpectral = await createSpectralWithConfFile(file!).catch(e => {
            console.error(`some error occurred loading conf file: ${e}`)
            return undefined
        })

        if (!maybeSpectral) {
            console.error("couldn't create spectral with configuration. Falling back to spectral with defaults...")
        }

        spectral = maybeSpectral
            ? maybeSpectral
            : createSpectralWithDefaults(patternIdsToApply ? patternIdsToApply : [])
    } else {
        spectral = createSpectralWithDefaults(patternIdsToApply ? patternIdsToApply : [])
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

    return convertResults(
        spectralResults.flat()
    )

    // configure spectral to use our rules only.
    function createSpectralWithDefaults(rulesToApply: (keyof Ruleset['rules'])[]): Spectral {
        console.debug("initializing spectral with defaults...")

        const s = new Spectral()

        //   configuring spectral to load our default rulesets
        //   and turn on only the recommended rules,
        // OR
        //   configure to load the default rulesets but with all
        //   rules not loaded and then explicitly turn on only the
        //   ones given in function parameters.
        if (!rulesToApply.length) {
            s.setRuleset({
                extends: [
                    [asyncapi as RulesetDefinition, 'recommended'],
                    [oas as RulesetDefinition, 'recommended'],
                ]
            })
        } else {
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

        console.info("rules [ENABLED]:")
        Object.values(s.ruleset!.rules).forEach(rule => {
            console.info(`${rule.name} - ${rule.enabled}`)
        })

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
    async function checkExistsDefaultConfFile(): Promise<[boolean, string?]> {
        async function fileExists(name: string) {
            return fs.promises
                .stat(name).then(s => s.isFile()).catch(_ => false)
        }

        console.debug(`[conf] supported files: ${supportedConfigFiles}`)

        // we look for the first file that exists in our array of supported files
        for (const supportedFile of supportedConfigFiles) {
            console.debug(`[conf] looking for: ${supportedFile}`)

            if (await fileExists(supportedFile)) {
                console.debug(`[conf] found the following: ${supportedFile}`)

                return [true, supportedFile]
            }
        }

        console.debug("[conf] couldn't find any of the configuration supported files")
        return [false, undefined]
    }
}
