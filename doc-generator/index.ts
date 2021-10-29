import axios from "axios"
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

const docsPath = "../docs/"

const repositoryUrlBase = "https://raw.githubusercontent.com/DavidAnson/markdownlint/v" + "0.24.0" + "/"

const ruleLink = new RegExp("<a name=.*<\/a>")

function getPatternId(title: string): string {
    return title.split("-")[0].replace("~~", "").trim()
}

function cleanRuleTitle(title: string): string {
    return title.replace(/~~/g, "")
}

async function createDescriptionFiles(rules: string[], rulesJson: any) {
    Promise.all(rules.map(async (rule, i, arrays) => {
        const body = rulesJson[rule]["raw"].replace(ruleLink, "").trim()
        const content = "# " + cleanRuleTitle(rule) + "\n\n" + body
        const ruleId = getPatternId(rule)
        await fs.writeFile(docsPath + "description/" + ruleId + ".md", content)
    }))
}

async function generateSpecification(ruleTitles: string[], patternsSchema: any) {
    const patternSpecs = ruleTitles.map((ruleTitle) => {
        const ruleId = getPatternId(ruleTitle)
        const propertiesStructure = patternsSchema["properties"][ruleId]["properties"]
        var parametersSpecs: ParameterSpec[] = []
        if(propertiesStructure) {
            var propertiesNames = Object.keys(propertiesStructure)
            parametersSpecs = propertiesNames.map((property) => 
                new ParameterSpec(property, propertiesStructure[property]["default"])
            )
        }

        const enabled = patternsSchema["properties"][ruleId]["default"] === true
        return new PatternSpec(ruleId, "Info", "CodeStyle", undefined, parametersSpecs, enabled)
    })

    const specification = new Specification("markdownlint", "0.24.0", patternSpecs)
    await writeFile(docsPath + "patterns.json", JSON.stringify(specification, null, 2))
}

async function generatePatternsDescription(ruleTitles: string[], patternsSchema: any) {
    const descriptionEntries = ruleTitles.map((ruleTitle) => {
        const ruleId = getPatternId(ruleTitle)

        const ruleSchema = patternsSchema["properties"][ruleId]

        const description =  ruleSchema["description"].split(" - ")[1]
        
        const propertiesStructure = ruleSchema["properties"]
        var parameters: DescriptionParameter[] = []
        if(propertiesStructure) {
            var propertiesNames = Object.keys(propertiesStructure)
            parameters = propertiesNames.map((property) => {
                return new DescriptionParameter(property, ruleSchema["properties"][property]["description"])
            })

        }

        const title = cleanRuleTitle(ruleTitle)
        return new DescriptionEntry(ruleId, title, description, undefined,  parameters)
    })

    await writeFile(docsPath + "description/description.json", JSON.stringify(descriptionEntries, null, 2) + "\n")
}

async function createFolderIfNotExists(dir: string) {
    const accessPromise = fs.access(dir)
    await accessPromise.catch(_ => fs.mkdir(dir))
}

async function main() {
    await createFolderIfNotExists(docsPath + "description")

    const rulesRequest = await axios.get(repositoryUrlBase + "doc/Rules.md")

    const rulesJson = md2json.parse(rulesRequest.data)

    const rulesSchemaRequest = await axios.get(repositoryUrlBase + "schema/markdownlint-config-schema.json")

    const rules = Object.keys(rulesJson["Rules"]).filter(a => a != "raw")

    await createDescriptionFiles(rules, rulesJson["Rules"])

    await generateSpecification(rules, rulesSchemaRequest.data)

    await generatePatternsDescription(rules, rulesSchemaRequest.data)
    
    return rules
}

main()
