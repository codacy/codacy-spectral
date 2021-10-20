import { ISpectralDiagnostic } from "@stoplight/spectral-core"

export function computeSuggestion(
  lineNumber: number,
  lineContent: string,
  fixInfo: String
): string | undefined {
  if (fixInfo) {
    return computeSuggestionWhenLineNumberIsDefined(
      lineNumber,
      lineContent,
      fixInfo
    )
  } else  {
    const column = lineNumber
    const newText = fixInfo
    const deleteCount = 0
    return (
      lineContent.slice(0, column) +
      newText +
      lineContent.slice(column + deleteCount)
    )
  }
  return undefined
}

function computeSuggestionWhenLineNumberIsDefined(
  lineNumber: number,
  lineContent: string,
  fixInfo: String
): string | undefined {
 {
    return lineContent + fixInfo
  }
}
