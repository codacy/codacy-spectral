import { deepStrictEqual } from "assert"
import { FixInfo } from "markdownlint"
import { computeSuggestion } from "../computeSuggestion"

describe("computeSuggestion", () => {
  const lineContent =
    "- Identify new Static Analysis issues"
  const line = 3
  it("should generate a suggestion replacing text", () => {
    const fix: FixInfo = {
        editColumn: 1,
        deleteCount: 1,
        insertText: "*",
    }

    const result = computeSuggestion(lineContent, fix)
    const expectedResult = '* Identify new Static Analysis issues'

    deepStrictEqual(result, expectedResult)
  })
  it("should generate a suggestion deleting text", () => {
    const fix: FixInfo = {
        editColumn: 1,
        deleteCount: 11,
    }

    const result = computeSuggestion(lineContent, fix)
    const expectedResult = 'new Static Analysis issues'

    deepStrictEqual(result, expectedResult)
  })
  it("should generate a suggestion adding text", () => {
    const fix: FixInfo = {
        editColumn: 38,
        insertText: " on Codacy",
    }

    const result = computeSuggestion(lineContent, fix)
    const expectedResult = '- Identify new Static Analysis issues on Codacy'

    deepStrictEqual(result, expectedResult)
  })
})
