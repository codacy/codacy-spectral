import {
    DescriptionEntry,
    DescriptionParameter,
    ParameterSpec,
    PatternSpec,
    Specification,
    writeFile,
  } from "codacy-seed"
import axios from "axios"
import * as md2json from "md-2-json"
import * as fs from "fs"
import markdownlint from "markdownlint"

const docsPath = "../docs/"

const repositoryUrlBase = "https://raw.githubusercontent.com/DavidAnson/markdownlint/v" + markdownlint.getVersion() + "/"

const ruleLink = new RegExp("<a name=.*<\/a>")

function getPatternId(title: string): string {
    return title.split("-")[0].replace("~~", "").trim()
}

function cleanRuleTitle(title: string): string {
    return title.replace(/~~/g, "")
}

function createDescriptionFiles(rules: string[], rulesJson: any): void {
    rules.forEach( (rule, i, arrays) => {
        const body = rulesJson[rule]["raw"].replace(ruleLink, "").trim()
        const content = "# " + cleanRuleTitle(rule) + "\n\n" + body
        const ruleId = getPatternId(rule)
        fs.writeFileSync(docsPath + "description/" + ruleId + ".md", content)
    })
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

    const specification = new Specification("markdownlint", markdownlint.getVersion(), patternSpecs)
    await writeFile(docsPath + "patterns.json", JSON.stringify(specification, null, 2))
}

async function generatePatternsDescription(ruleTitles: string[], patternsSchema: any) {
    const descriptionEntries = ruleTitles.map((ruleTitle) => {
        const ruleId = getPatternId(ruleTitle)

        const ruleSchema = patternsSchema["properties"][ruleId]

        const description =  ruleSchema["description"].split("-")[1]
        
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

function createFolderIfNotExists(dir: string) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

async function main() {
    createFolderIfNotExists(docsPath + "description")

    const rulesRequest = await axios.get(repositoryUrlBase + "doc/Rules.md")

    const rulesJson = md2json.parse(rulesRequest.data)

    const rulesSchemaRequest = await axios.get(repositoryUrlBase + "schema/markdownlint-config-schema.json")

    const rules = Object.keys(rulesJson["Rules"]).filter(a => a != "raw")

    createDescriptionFiles(rules, rulesJson["Rules"])

    generateSpecification(rules, rulesSchemaRequest.data)

    generatePatternsDescription(rules, rulesSchemaRequest.data)
    
    return rules
}

main()
