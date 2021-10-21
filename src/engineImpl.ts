import { Codacyrc, Engine, ToolResult } from "codacy-seed"

import { convertResults } from "./convertResults"
import { Spectral, Document } from "@stoplight/spectral-core"
import { readFile } from "codacy-seed"
import { Yaml, Json } from "@stoplight/spectral-parsers"
const { oas, asyncapi } = require("@stoplight/spectral-rulesets");
import * as glob from "glob"

export const engineImpl: Engine = async function (
  codacyrc?: Codacyrc
): Promise<ToolResult[]> {

  const spectral = new Spectral();

  spectral.setRuleset({
        extends: [oas, asyncapi]
    });

  const codacyrcFiles = codacyrc && codacyrc.files ? codacyrc.files : glob.sync("**/*.+(json|yaml|yml)")

  const files = await Promise.all(
    codacyrcFiles.map(async (file) => {
      const fileContent = await readFile(file)
      return [file, fileContent.toString()]
    }) || []
  )

  const spectralResults = await Promise.all(
    files.map((file) => {
      const filename = file[0];
      const extension = file[0].substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
      console.log(extension)
      const myDocument = extension === "json" ? new Document(file[1], Json, filename) : new Document(file[1], Yaml, filename)
      return spectral.run(myDocument)
    }).flat()
  )

  return convertResults(
      spectralResults.flat()
  )
}
