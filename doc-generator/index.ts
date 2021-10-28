import { Rule, Ruleset } from "@stoplight/spectral-core"
import axios from "axios"
import { DiagnosticSeverity } from "@stoplight/types"
const { oas, asyncapi } = require("@stoplight/spectral-rulesets");

import {
    Category,
    Level,
    DescriptionEntry,
    ParameterSpec,
    PatternSpec,
    Specification,
    writeFile
  } from "codacy-seed"
import { promises as fs } from "fs"

import pack from "./package-lock.json"


const docsPath = "../docs/"

const spectralVersionInUse = pack.dependencies["@stoplight/spectral-rulesets"].version

const openapiRulesdocumentationUrl = `https://raw.githubusercontent.com/stoplightio/spectral/%40stoplight/spectral-rulesets-v${spectralVersionInUse}/docs/reference/openapi-rules.md`
const asyncapiRulesdocumentationUrl = `https://raw.githubusercontent.com/stoplightio/spectral/%40stoplight/spectral-rulesets-v${spectralVersionInUse}/docs/reference/asyncapi-rules.md`

async function createOpenapiDescriptionFiles() {

    const rulesRequest = await axios.get(openapiRulesdocumentationUrl)
    const rulesJson = extractRulesMds(rulesRequest.data)

    Promise.all(Object.keys(rulesJson).map(ruleKey => {
        const content = "#" + rulesJson[ruleKey]
        fs.writeFile(docsPath + "description/" + ruleKey + ".md", content)
    }))
}

async function createAsyncapiDescriptionFiles() {
    const rulesRequest = await axios.get(asyncapiRulesdocumentationUrl)
    const rulesJson = extractRulesMds(rulesRequest.data)

    Promise.all(Object.keys(rulesJson).map(ruleKey => {
        const content = "#" + rulesJson[ruleKey]
        fs.writeFile(docsPath + "description/" + ruleKey + ".md", content)
    }))
}

async function generateSpecification(ruleset: Ruleset) {
    const patternSpecs = Object.entries(ruleset.rules).map((rule) => {
        const ruleId = rule[1].name
        var parametersSpecs: ParameterSpec[] = []
        const level: Level = calculateLevel(rule[1].severity)
        const category: Category = calculateCategory(rule[1])

        return new PatternSpec(ruleId, level, category, undefined, parametersSpecs, true)
    })

    const specification = new Specification("spectral-rulesets", "1.2.6", patternSpecs)
    await writeFile(docsPath + "patterns.json", JSON.stringify(specification, null, 2))
}

async function generatePatternsDescription(ruleset: Ruleset) {
    const descriptionEntries = Object.entries(ruleset.rules).map((rule) => {
        const patternId = rule[1].name
        const description =  rule[1].description ? rule[1].description : "N/A"
        const title = rule[1].name + " - " + description

        return new DescriptionEntry(patternId, title, description as string)
    })

    await writeFile(docsPath + "description/description.json", JSON.stringify(descriptionEntries, null, 2) + "\n")
}

async function createFolderIfNotExists(dir: string) {
    const accessPromise = fs.access(dir)
    await accessPromise.catch(_ => fs.mkdir(dir))
}

function extractRulesMds(mdContent: string): Record<string, string> {
    const rules: Record<string, string> = {}

    const contentSplitByRule = mdContent.split('###');
    contentSplitByRule.filter(rule => !rule.startsWith("#")).forEach(rule => rules[extractAndSanitizeTitle(rule)] = sanitizeRule(rule))

    return rules
    
}

function extractAndSanitizeTitle(rule: string): string {
   return rule.split('\n')[0].replace('\\', '').trim()
}

function sanitizeRule(rule: string): string {
    return rule.split('##')[0].replace('\\', '')
 }

function calculateLevel(severity: DiagnosticSeverity) : Level{
    switch(severity){
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
    switch(rule.definition.type) {
        case "style":
            return "CodeStyle"
        case "validation":
            return "CodeStyle"
    }

    // TODO: mapping to codacy categories

    //"ErrorProne" | "CodeStyle" | "Complexity" | "UnusedCode" | "Security" | "Compatibility" | "Performance" | "Documentation" | "BestPractice";

    return "CodeStyle"
    
}

async function main() {
    await createFolderIfNotExists(docsPath + "description")

    const rules = new Ruleset({
        extends: [oas, asyncapi]
      });

    await createOpenapiDescriptionFiles()
    await createAsyncapiDescriptionFiles()

    await generateSpecification(rules)
    await generatePatternsDescription(rules)
    
    return rules
}

main()