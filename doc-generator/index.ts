import { Document, Ruleset,Spectral } from "@stoplight/spectral-core"
import axios from "axios"
import { DiagnosticSeverity } from "@stoplight/types"
import { Category, Level, readFile } from "codacy-seed"
const { oas, asyncapi } = require("@stoplight/spectral-rulesets");

import {
    DescriptionEntry,
    DescriptionParameter,
    ParameterSpec,
    PatternSpec,
    Specification,
    writeFile,
  } from "codacy-seed"
import { promises as fs } from "fs"
import * as md2json from "md-2-json"

import pack from "./package-lock.json"


const docsPath = "../docs/"

const openapiRulesdocumentationUrl = "https://raw.githubusercontent.com/stoplightio/spectral/develop/docs/reference/openapi-rules.md"
const asyncapiRulesdocumentationUrl = "https://raw.githubusercontent.com/stoplightio/spectral/develop/docs/reference/asyncapi-rules.md"

async function createOpenapiDescriptionFiles() {

    const rulesRequest = await axios.get(openapiRulesdocumentationUrl)
    const rulesJson = await md2json.parse(rulesRequest.data)

    Promise.all(Object.keys(oas.rules).map(rulekey => {
        const ruleId = rulekey
        console.log("Rule Id: " + ruleId)

        const body = parseBodyFromOpanapiRulesJson(rulesJson, ruleId)

        const content = "# " + ruleId + "\n\n" + body

        fs.writeFile(docsPath + "description/" + ruleId + ".md", content)
    }))
}

async function createAsyncapiDescriptionFiles() {

    const rulesRequest = await axios.get(asyncapiRulesdocumentationUrl)
    const rulesJson = await md2json.parse(rulesRequest.data)

    Promise.all(Object.keys(oas.rules).map(rulekey => {
        const ruleId = rulekey

        const body = parseBodyFromOpanapiRulesJson(rulesJson, ruleId)

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
        const category: Category = calculateCategory(rule[1].given)

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
    // await createAsyncapiDescriptionFiles()

    await generateSpecification(rules)

    await generatePatternsDescription(rules)
    
    return rules
}

//main()
function parseBodyFromOpanapiRulesJson(rulesJson: any, ruleId: string) {

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


async function main2() {
    const spectralVersionInUse = pack.dependencies["@stoplight/spectral-rulesets"].version
    const repositoryUrl = "https://raw.githubusercontent.com/stoplightio/spectral"
    const repoTagVersion = `%40stoplight/spectral-rulesets-v${spectralVersionInUse}`
    const humanDocRules = "docs/reference/openapi-rules.md"
    const rawDocFileUrl = repositoryUrl + "/" + repoTagVersion +  "/" + humanDocRules

    console.log(`Read from package-lock.json the rules version in use is ${spectralVersionInUse}`)
    console.log(`Downloading rules descriptions from: ${rawDocFileUrl}`)

    axios.get(rawDocFileUrl)
        .then(rulesRaw => {
            const rulesInJson = md2json.parse(rulesRaw.data)

            console.log(rulesRaw.data)
            console.log(rulesInJson)
        })

}

//main2()
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

function calculateCategory(given: string[]): Category {

    // type?: 'validation' | 'style';

    //"ErrorProne" | "CodeStyle" | "Complexity" | "UnusedCode" | "Security" | "Compatibility" | "Performance" | "Documentation" | "BestPractice";

    return "CodeStyle"
    
}

