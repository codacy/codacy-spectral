import { readFile, Issue } from "codacy-seed"
import { LintResults } from "markdownlint"
import { computeSuggestion } from "./computeSuggestion"


export async function convertResults(report: LintResults): Promise<Issue[]> {
  const promiseArray = Object.entries(report).map(async entry => {
    let [filename, issues] = entry
    const fileContent = await readFile(filename)
    const lines = fileContent.toString().split("\n")
    return issues.map(issue => {
      const line = issue.lineNumber
      const message = issue.errorDetail
      const patternId = issue.ruleNames[0]
      const suggestion = issue.fixInfo ? computeSuggestion(
        lines[line-1],
        issue.fixInfo
      ) : undefined
      return new Issue(filename, message, patternId, line, suggestion)
    })
  })
  const something = await Promise.all(promiseArray)
  return something.flat()
}
