import { Issue } from "codacy-seed"
import { ISpectralDiagnostic } from "@stoplight/spectral-core"

export function convertResults(
  report: ISpectralDiagnostic[],
  filenameToContent: { [x: string]: string }
): Issue[] {
  return Object.entries(report).flatMap((entry) => {
    let [filename, issue] = entry
    const fileContent = filenameToContent[filename]
    const lineNumber = issue.range.start.line
    const message = issue.message
    const patternId = ""
    const suggestion = issue.message
    return new Issue(filename, message, patternId, lineNumber, suggestion)
  })
}
