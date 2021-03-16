import { FixInfo } from "markdownlint"

export function computeSuggestion(
    lineContent: string,
    fixInfo: FixInfo
): string {
    const column = fixInfo.editColumn ? fixInfo.editColumn - 1 : 0
    const newText = fixInfo.insertText ? fixInfo.insertText : ""
    const deleteCount = fixInfo.deleteCount ? fixInfo.deleteCount : 0
    const result = lineContent.slice(0, column) + newText + lineContent.slice(column + deleteCount)
    return result
}
