import { readFile, Issue } from "codacy-seed"
import { LintResults } from "markdownlint"
import { computeSuggestion } from "./computeSuggestion"


export function convertResults(report: LintResults): Promise<Issue[]> {
  const getFileContent = async (filename: string) => {
    const fileContent = await readFile(filename)
    return fileContent.toString()
  }  
  
  return convertResultsWithGetContent(report, getFileContent)
}

export function convertResultsWithStrings(report: LintResults, strings: {[x: string]: string }): Promise<Issue[]> {
  return convertResultsWithGetContent(report, (name) => Promise.resolve(strings[name]))
}

async function convertResultsWithGetContent(report: LintResults, getContent: (name: string) => Promise<string>): Promise<Issue[]> {
  const promiseArray = Object.entries(report).map(async entry => {
    let [filename, issues] = entry
    const fileContent = await getContent(filename)
    const lines = fileContent.toString().split("\n")
    return issues.map(issue => {
      const lineNumber = issue.lineNumber
      const message = issue.errorDetail ?? issue.ruleDescription
      const patternId = issue.ruleNames[0]
      const suggestion = issue.fixInfo ? computeSuggestion(
        lineNumber,
        lines[lineNumber-1],
        issue.fixInfo
      ) : undefined
      return new Issue(filename, message, patternId, lineNumber, suggestion)
    })
  })
  const issuesPromise = await Promise.all(promiseArray)
  return issuesPromise.flat()
}
