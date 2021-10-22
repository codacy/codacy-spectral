import { Codacyrc, Engine, Pattern, Tool, ToolResult } from "codacy-seed"

import { convertResults } from "./convertResults"
import { Spectral, Document, Ruleset } from "@stoplight/spectral-core"
import { readFile } from "codacy-seed"
import { Yaml, Json } from "@stoplight/spectral-parsers"
const { oas, asyncapi } = require("@stoplight/spectral-rulesets");

import {extractPatternIdsToApply, extractFiles} from "./configCreator"

export const engineImpl: Engine = async function (
  codacyrc?: Codacyrc
): Promise<ToolResult[]> {

  const spectral = new Spectral();

  const codacyrcFiles = await extractFiles(codacyrc)

  const patternIdsToApply = await extractPatternIdsToApply(codacyrc)

  if (!patternIdsToApply) {
    return []
  }

  spectral.setRuleset(new Ruleset({
    extends: [oas, asyncapi]
  }));

  
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

  // console.log(JSON.stringify(spectralResults.flat(), null, 4));

  return convertResults(
      spectralResults.flat().filter(result => patternIdsToApply.includes(result.code as string))
  )
}
