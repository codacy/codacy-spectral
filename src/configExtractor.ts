import { Codacyrc } from "codacy-seed"
import { toolName } from "./toolMetadata"
import * as glob from "glob"

export async function extractPatternIdsToApply(
    codacyrc?: Codacyrc
): Promise<string[] | undefined> {
    const tool = codacyrc?.tools ? codacyrc?.tools.find((codacyTool) => codacyTool.name === toolName) : undefined
    return tool?.patterns?.map(pattern => pattern.patternId)
}

export async function extractFiles(
    codacyrc?: Codacyrc
): Promise<string[]> {
    return codacyrc && codacyrc.files ? codacyrc.files : glob.sync("**/*.+(json|yaml|yml)")
}
