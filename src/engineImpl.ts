import { Codacyrc, Engine, ToolResult } from "codacy-seed"

import { convertResults } from "./convertResults"
import { Spectral, Document, Ruleset, RulesetDefinition } from "@stoplight/spectral-core"
import { readFile } from "codacy-seed"
import { Json, Yaml } from "@stoplight/spectral-parsers"
import { oas, asyncapi } from "@stoplight/spectral-rulesets"
import * as glob from "glob"

export const engineImpl: Engine = async function (
  codacyrc?: Codacyrc
): Promise<ToolResult[]> {

  const spectral = new Spectral();

  spectral.setRuleset(new Ruleset({
    extends: [oas, asyncapi]
  }));

  const codacyrcFiles = codacyrc && codacyrc.files ? codacyrc.files : glob.sync("**/*.json")

  const files = await Promise.all(
    codacyrcFiles.map(async (file) => {
      const fileContent = readFile(file)
      return [file, fileContent.toString()]
    }) || []
  )

  const spectralResults = await Promise.all(
    files.map((file) => {
      const myDocument = new Document(file[1], Json, file[0])
      return spectral.run(myDocument)
    }).flat()
  )

  return convertResults(
    spectralResults.flat()
  )
}
