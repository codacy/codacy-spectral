import { Codacyrc, Pattern } from "codacy-seed"
import { toolName } from "./toolMetadata"
import { fromPairs } from "lodash"
import * as glob from "glob"


function patternsToRules(
    patterns: Pattern[]
) {
    const rules = patterns.map((pattern) => {
        const patternId = pattern.patternId
        if (pattern.parameters) {
            const parameters = fromPairs(pattern.parameters.map((p) => [p.name, p.value]))
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
): Promise<String> {
    if (codacyInput && codacyInput.tools) {
        const markdownlint = codacyInput.tools.find((tool) => tool.name === toolName)
        if (markdownlint && markdownlint.patterns) {
            return ""
        }
    }
    return ""
}

