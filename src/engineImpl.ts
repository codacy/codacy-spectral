import { Codacyrc, Engine, Pattern, Tool, ToolResult } from "codacy-seed"

import { convertResults } from "./convertResults"
import { Spectral, Document } from "@stoplight/spectral-core"
import { readFile } from "codacy-seed"
import { Yaml, Json } from "@stoplight/spectral-parsers"
const { oas, asyncapi } = require("@stoplight/spectral-rulesets");
import * as glob from "glob"

import {extractRulesToApply, extractFiles} from "./configCreator"

export const engineImpl: Engine = async function (
  codacyrc?: Codacyrc
): Promise<ToolResult[]> {

  const spectral = new Spectral();

  const codacyrcFiles = await extractFiles(codacyrc)

  const oasRulesToUse = await extractRulesToApply(oas, codacyrc)
  const asyncRulesToUse = await extractRulesToApply(asyncapi, codacyrc)

  const rulesToApply = [...oasRulesToUse || [], ...asyncRulesToUse || []]

  console.log("Rules: " + JSON.stringify(rulesToApply, null, 4));

  if (!rulesToApply) {
    return []
  }

  spectral.setRuleset(Object.fromEntries(rulesToApply))
  
  const files = await Promise.all(
    codacyrcFiles.map(async (file) => {
      const fileContent = await readFile(file)
      return [file, fileContent.toString()]
    }) || []
  )

  const spectralResults = await Promise.all(
    files.map((file) => {
      const filename = file[0]
      const extension = file[0].substring(filename.lastIndexOf('.') + 1, filename.length) || filename
      const myDocument = extension === "json" ? new Document(file[1], Json, filename) : new Document(file[1], Yaml, filename)
      return spectral.run(myDocument)
    }).flat()
  )

  console.log(JSON.stringify(spectralResults.flat(), null, 4));

  return convertResults(
      spectralResults.flat()
  )
}
