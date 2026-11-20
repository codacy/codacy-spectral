import { Rule, Ruleset } from "@stoplight/spectral-core"
import { DiagnosticSeverity } from "@stoplight/types"
import axios from "axios"
const { oas, asyncapi } = require("@stoplight/spectral-rulesets");

import {
    Category,
    DescriptionEntry,
    Level,
    ParameterSpec,
    PatternSpec,
    Specification,
    writeFile
} from "codacy-seed"
import { promises as fs } from "fs"

import pack from "./package-lock.json"

const docsPath = "../docs/"

const spectralVersionInUse = pack.packages["node_modules/@stoplight/spectral-rulesets"].version
const repositoryUrl = "https://raw.githubusercontent.com/stoplightio/spectral"
const repoTagVersion = `%40stoplight/spectral-rulesets-${spectralVersionInUse}`

const openapiHumanReadable = "docs/reference/openapi-rules.md"
const asyncapiHumanReadable = "docs/reference/asyncapi-rules.md"

const openapiRulesdocumentationUrl = repositoryUrl + "/" + repoTagVersion + "/" + openapiHumanReadable
const asyncapiRulesdocumentationUrl = repositoryUrl + "/" + repoTagVersion + "/" + asyncapiHumanReadable


// upstream docs sometimes spell a heading differently from the rule name (e.g. "oas3_callbacks_in_callbacks")
function resolveRuleName(docTitle: string, ruleNames: Set<string>): string | undefined {
    if (ruleNames.has(docTitle)) return docTitle
    const hyphenated = docTitle.replace(/_/g, "-")
    return ruleNames.has(hyphenated) ? hyphenated : undefined
}

async function createDescriptionFiles(rulesDocUrl: string, ruleNames: Set<string>): Promise<void[]> {
    const rulesRequest = await axios.get(rulesDocUrl)
    const rulesJson = extractRulesMds(rulesRequest.data)

    return Promise.all(Object.keys(rulesJson).map(docTitle => {
        const ruleName = resolveRuleName(docTitle, ruleNames)
        if (!ruleName) {
            console.warn(`skipping doc section "${docTitle}": no matching rule`)
            return Promise.resolve()
        }

        const body = rulesJson[docTitle].split("\n").slice(1).join("\n")
        const content = "# " + ruleName + "\n" + body
        return fs.writeFile(docsPath + "description/" + ruleName + ".md", content.trim().concat("\n"))
    }))
}

// remove description files of rules that no longer exist in Spectral
async function removeStaleDescriptionFiles(ruleNames: Set<string>): Promise<void> {
    const files = await fs.readdir(docsPath + "description")
    await Promise.all(files
        .filter(file => file.endsWith(".md") && !ruleNames.has(file.slice(0, -3)))
        .map(file => {
            console.warn(`removing stale description file: ${file}`)
            return fs.unlink(docsPath + "description/" + file)
        }))
}

async function generateSpecification(ruleset: Ruleset): Promise<void> {
    const patternSpecs = Object.entries(ruleset.rules).map((rule) => {
        const ruleId = rule[1].name
        const parametersSpecs: ParameterSpec[] = []
        const level: Level = calculateLevel(rule[1].severity)
        const category: Category = calculateCategory(rule[1])

        return new PatternSpec(ruleId, level, category, undefined, undefined, parametersSpecs, rule[1].recommended);
    })

    const specification = new Specification("spectral", spectralVersionInUse, patternSpecs)
    await writeFile(docsPath + "patterns.json", JSON.stringify(specification, null, 2) + '\n')
}

// first prose paragraph of the rule's markdown doc, used when Spectral defines no description
async function descriptionFromMarkdown(patternId: string): Promise<string | undefined> {
    const content = await fs.readFile(docsPath + "description/" + patternId + ".md", "utf8").catch(() => undefined)
    if (!content) return undefined

    const paragraph = content
        .split(/\n\s*\n/)
        .map(block => block.trim())
        .find(block => block && !block.startsWith("#") && !block.startsWith("```") && !block.startsWith("|"))

    return paragraph ? paragraph.replace(/\s+/g, " ") : undefined
}

async function generatePatternsDescription(ruleset: Ruleset): Promise<void> {
    const descriptionEntries = await Promise.all(Object.entries(ruleset.rules).map(async (rule) => {
        const patternId = rule[1].name
        const description = rule[1].description || await descriptionFromMarkdown(patternId) || rule[1].message || "N/A"
        const title = rule[1].name + " - " + description

        return new DescriptionEntry(patternId, title, description)
    }))

    await writeFile(docsPath + "description/description.json", JSON.stringify(descriptionEntries, null, 2))
}

async function createFolderIfNotExists(dir: string) {
    const accessPromise = fs.access(dir)
    await accessPromise.catch(_ => fs.mkdir(dir))
}

function extractRulesMds(mdContent: string): Record<string, string> {
    const rules: Record<string, string> = {}

    const contentSplitByRule = mdContent.split('###');

    contentSplitByRule
        .filter(rule => !rule.startsWith("#"))
        .forEach(rule => rules[extractAndSanitizeTitle(rule)] = sanitizeRule(rule))

    return rules
}

function extractAndSanitizeTitle(rule: string): string {
    return rule.split('\n')[0].replace('\\', '').trim()
}

function sanitizeRule(rule: string): string {
    return rule.split('##')[0].replace('\\', '')
}

function calculateLevel(severity: DiagnosticSeverity): Level {
    switch (severity) {
        case DiagnosticSeverity.Error:
            return "Error"
        case DiagnosticSeverity.Warning:
            return "Warning"
        case DiagnosticSeverity.Information:
            return "Info"
        case DiagnosticSeverity.Hint:
            return "Info"
    }
}

function calculateCategory(rule: Rule): Category {
    switch (rule.definition.type) {
        case "style":
            return "CodeStyle"
        case "validation":
            return "ErrorProne"
    }
    return "CodeStyle"
}

async function main() {
    await createFolderIfNotExists(docsPath + "description")

    const rules = new Ruleset({
        extends: [oas, asyncapi]
    });

    const ruleNames = new Set(Object.values(rules.rules).map(rule => rule.name))

    await createDescriptionFiles(openapiRulesdocumentationUrl, ruleNames)
    await createDescriptionFiles(asyncapiRulesdocumentationUrl, ruleNames)
    await removeStaleDescriptionFiles(ruleNames)

    await generateSpecification(rules)
    await generatePatternsDescription(rules)

    return rules
}

main()
