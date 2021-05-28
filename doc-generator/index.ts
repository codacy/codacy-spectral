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

function createDescriptionFiles(rules: string[], rulesJson: any): void {
    rules.forEach( (rule, i, arrays) => {
        const body = rulesJson[rule]["raw"].replace(ruleLink, "").trim()
        const content = "# " + rule + "\n\n" + body
        const ruleId = getPatternId(rule)
        fs.writeFileSync(docsPath + "description/" + ruleId + ".md", content)
    })
}

async function generateSpecification(ruleTitles: string[]) {
    const request = await axios.get(repositoryUrlBase + "schema/markdownlint-config-schema.json")

    const patternsSchema = request.data

    const patternSpecs = ruleTitles.map((ruleTitle) => {
        const ruleId = getPatternId(ruleTitle)
        const propertiesStructure = patternsSchema["properties"][ruleId]["properties"]
        var parametersSpecs: ParameterSpec[] = []
        if(propertiesStructure) {
            var propertiesNames = Object.keys(propertiesStructure)
            parametersSpecs = propertiesNames.map((property) => {
                return new ParameterSpec(property, propertiesStructure[property]["default"])
            })

        }
        return new PatternSpec(ruleId, "Info", "CodeStyle", undefined, parametersSpecs, false)
    })

    const specification = new Specification("markdownlint", markdownlint.getVersion(), patternSpecs)
    await writeFile(docsPath + "patterns.json", JSON.stringify(specification, null, 2))
}

async function generatePatternsDescription(ruleTitles: string[]) {
    const request = await axios.get(repositoryUrlBase + "schema/markdownlint-config-schema.json")

    const patternsSchema = request.data

    const descriptionEntries = ruleTitles.map((ruleTitle) => {
        const ruleId = getPatternId(ruleTitle)

        const description =  patternsSchema["properties"][ruleId]["description"].split("-")[1]
        
        const propertiesStructure = patternsSchema["properties"][ruleId]["properties"]
        var parameters: DescriptionParameter[] = []
        if(propertiesStructure) {
            var propertiesNames = Object.keys(propertiesStructure)
            parameters = propertiesNames.map((property) => {
                return new DescriptionParameter(property, patternsSchema["properties"][ruleId]["properties"][property]["description"])
            })

        }

        const title = ruleTitle.replace(/~~/g, "")
        return new DescriptionEntry(ruleId, title, description, undefined,  parameters)
    })

    await writeFile(docsPath + "description/description.json", JSON.stringify(descriptionEntries, null, 2))
}

function createFolderIfNotExists(dir: string) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

async function main() {
    createFolderIfNotExists(docsPath + "description")

    const request = await axios.get(repositoryUrlBase + "doc/Rules.md")

    const rulesJson = md2json.parse(request.data)

    const rules = Object.keys(rulesJson["Rules"]).filter(a => a != "raw")

    createDescriptionFiles(rules, rulesJson["Rules"])

    generateSpecification(rules)

    generatePatternsDescription(rules)
    
    return rules
}

main()