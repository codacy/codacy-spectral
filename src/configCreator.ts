import { Codacyrc, Pattern } from "codacy-seed"
import { Configuration, Options, promises } from "markdownlint"
import { toolName } from "./toolMetadata"
import { fromPairs } from "lodash"


function patternsToRules(
    patterns: Pattern[]
) {
    const rules = patterns.map((pattern) => {
        const patternId = pattern.patternId
        if (pattern.parameters) {
            const parameters = (pattern.parameters.length == 1 && pattern.parameters[0].name == "unnamedParam") ?
                pattern.parameters[0].value :
                fromPairs(
                    pattern.parameters.map((p) => [p.name, p.value])
                )
            return [patternId, parameters]
        } else {
            return [patternId, true]
        }
    })
    rules.push(["default", true])
    return fromPairs(rules)
}

async function createConfiguration(
    codacyInput?: Codacyrc
): Promise<Configuration> {
    if (codacyInput && codacyInput.tools) {
        const markdownlint = codacyInput.tools.find((tool) => tool.name === toolName)
        if (markdownlint && markdownlint.patterns) {
            return patternsToRules(markdownlint.patterns)
        }
    }
    return promises.readConfig(".markdownlint.json")
}

export async function configCreator(
    codacyInput?: Codacyrc
): Promise<Options> {
    const configuration = await createConfiguration(codacyInput)

    const files = codacyInput && codacyInput.files ? codacyInput.files : [] // TODO: search for all the files
    const options: Options = {
        files: files,
        config: configuration,
        resultVersion: 3
    }
    return options
}
