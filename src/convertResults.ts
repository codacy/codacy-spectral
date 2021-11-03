import { Issue } from "codacy-seed"
import { ISpectralDiagnostic } from "@stoplight/spectral-core"

export function convertResults(
  report: ISpectralDiagnostic[]
): Issue[] {
  return report.map((issue) => {
    const filename = issue.source
    const lineNumber = issue.range.start.line + 1
    const message = issue.message
    const patternId = `${issue.code}`
    return new Issue(filename!, message, patternId, lineNumber)
  })
}
