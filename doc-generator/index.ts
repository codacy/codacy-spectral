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
    writeFile,
    readFile
  } from "codacy-seed"
import { promises as fs } from "fs"
import * as md2json from "md-2-json"

import pack from "./package-lock.json"


const docsPath = "../docs/"

const spectralVersionInUse = pack.dependencies["@stoplight/spectral-rulesets"].version

const openapiRulesdocumentationUrl = `https://raw.githubusercontent.com/stoplightio/spectral/%40stoplight/spectral-rulesets-v${spectralVersionInUse}/docs/reference/openapi-rules.md`
const asyncapiRulesdocumentationUrl = `https://raw.githubusercontent.com/stoplightio/spectral/%40stoplight/spectral-rulesets-v${spectralVersionInUse}/docs/reference/asyncapi-rules.md`

console.log(openapiRulesdocumentationUrl)
console.log(asyncapiRulesdocumentationUrl)

async function createOpenapiDescriptionFiles() {

    const rulesRequest = await axios.get(openapiRulesdocumentationUrl)
    const rulesJson = await md2json.parse(rulesRequest.data)

    Promise.all(Object.keys(oas.rules).map(rulekey => {
        const ruleId = rulekey

        const body = parseBodyFromOpenapiRulesJson(rulesJson, ruleId)

        const content = "# " + ruleId + "\n\n" + body

        fs.writeFile(docsPath + "description/" + ruleId + ".md", content)
    }))
}

async function createAsyncapiDescriptionFiles() {

    // TODO: implement parser that parses the asyncapi rules

    const rulesRequest = await axios.get(asyncapiRulesdocumentationUrl)

    const file = await readFile(docsPath + "description/asyncapirules.md")

    // fs.writeFile(docsPath + "description/asyncapirules.md", rulesRequest.data)

    const rulesJson = await md2json.parse(file.toString())

    console.log(JSON.stringify(rulesJson, null, 5))

    Promise.all(Object.keys(asyncapi.rules).map(rulekey => {
        const ruleId = rulekey

        const body = parseBodyFromAsyncapiRulesJson(rulesJson, ruleId)

        const content = "# " + ruleId + "\n\n" + body

        fs.writeFile(docsPath + "description/" + ruleId + ".md", content)
    }))
}

async function generateSpecification(ruleset: Ruleset) {
    const patternSpecs = Object.entries(ruleset.rules).map((rule) => {
        const ruleId = rule[1].name
        var parametersSpecs: ParameterSpec[] = []
        const enabled = true

        const level: Level = calculateLevel(rule[1].severity)
        const category: Category = calculateCategory(rule[1])

        DiagnosticSeverity[rule[1].severity]

        return new PatternSpec(ruleId, level, "CodeStyle", undefined, parametersSpecs, true)
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

function parseBodyFromOpenapiRulesJson(rulesJson: any, ruleId: string): string | undefined {

    // TODO: clean up, or implement a specific parser, come up with escaped characters solution

    const ruleIdEscaped = ruleId.replace('$', '\\$')

    const bodyV2V3 = rulesJson["OpenAPI Rules"]["OpenAPI v2 & v3"][ruleId]

    if (bodyV2V3) {
        return bodyV2V3["raw"]
    }

    const bodyV2V3Escaped = rulesJson["OpenAPI Rules"]["OpenAPI v2 & v3"][ruleIdEscaped]

    if (bodyV2V3Escaped) {
        return bodyV2V3Escaped["raw"]
    }

    const bodyV2 = rulesJson["OpenAPI Rules"]["OpenAPI v2.0-only"][ruleId]

    if (bodyV2) {
        return bodyV2["raw"]
    }

    const bodyV2Escaped = rulesJson["OpenAPI Rules"]["OpenAPI v2 & v3"][ruleIdEscaped]

    if (bodyV2Escaped) {
        return bodyV2Escaped["raw"]
    }

    const bodyV3 = rulesJson["OpenAPI Rules"]["OpenAPI v3-only"][ruleId]

    if (bodyV3) {
        return bodyV3["raw"]
    }

    const bodyV3Escaped = rulesJson["OpenAPI Rules"]["OpenAPI v2 & v3"][ruleIdEscaped]

    if (bodyV3Escaped) {
        return bodyV3Escaped["raw"]
    }
}

function parseBodyFromAsyncapiRulesJson(rulesJson: any, ruleId: string) {

    // TODO: clean up, or implement a specific parser
    return rulesJson["AsyncAPI Rules"]["test"][ruleId]["raw"]
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

