import {ISpectralDiagnostic} from "@stoplight/spectral-core"
import {Issue} from "codacy-seed"

export function convertResults(
    report: ISpectralDiagnostic[]
): Issue[] {
    return report.map((issue) => {
        const filename = issue.source
        // spectral api start line 0 based, adding 1 to comply with our api
        const lineNumber = issue.range.start.line + 1
        const message = issue.message
        const patternId = `${issue.code}`
        return new Issue(filename!, message, patternId, lineNumber)
    })
}
