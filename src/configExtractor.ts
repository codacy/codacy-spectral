import {Codacyrc} from "codacy-seed"
import * as glob from "glob"

import {toolName} from "./toolMetadata"

export async function extractPatternsFromRC(
    codacyrc?: Codacyrc
): Promise<string[] | undefined> {
    const tool = codacyrc?.tools ? codacyrc?.tools.find((codacyTool) => codacyTool.name === toolName) : undefined
    return tool?.patterns?.map(pattern => pattern.patternId)
}

export async function extractFilesFromRC(
    codacyrc?: Codacyrc
): Promise<string[]> {
    return codacyrc && codacyrc.files ? codacyrc.files : glob.sync("**/*.+(json|yaml|yml)")
}
