import { Codacyrc, Pattern } from "codacy-seed"
import { toolName } from "./toolMetadata"
import * as glob from "glob"

export async function extractRulesToApply(
    rulesPool: Record<string, string>,
    codacyrc?: Codacyrc
): Promise<string[][] | undefined> {

    const tool = codacyrc?.tools ? codacyrc?.tools.find((codacyTool) => codacyTool.name === toolName) : undefined
    const patterns = tool?.patterns
    
    const rulesToApply = tool?.patterns?.filter(pattern => rulesPool[pattern.patternId as "tag-description"])
        .map(pattern => [pattern.patternId, rulesPool[pattern.patternId as "tag-description"]])
  
    return rulesToApply
    
}

export async function extractFiles(
    codacyrc?: Codacyrc
): Promise<string[]> {
    return codacyrc && codacyrc.files ? codacyrc.files : glob.sync("**/*.+(json|yaml|yml)")
}
