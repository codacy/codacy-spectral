import { Codacyrc, Engine, ToolResult } from "codacy-seed"
import { pathExists } from "fs-extra"

// import { configCreator } from "./configCreator"
import { convertResults } from "./convertResults"
import { promises } from "markdownlint"
import { configCreator } from "./configCreator"

export const engineImpl: Engine = async function (
  codacyrc?: Codacyrc
): Promise<ToolResult[]> {

  const options = await configCreator(codacyrc)
  
  const markdownlintResults = await promises.markdownlint(options)

  const issues = await convertResults(markdownlintResults)
  
  return issues
}
