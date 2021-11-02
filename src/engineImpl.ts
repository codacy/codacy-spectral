import { Codacyrc, Engine, ToolResult } from "codacy-seed"

import { convertResults } from "./convertResults"
import { Spectral, Document, Ruleset } from "@stoplight/spectral-core"
import { readFile } from "codacy-seed"
import { Yaml, Json } from "@stoplight/spectral-parsers"
const { oas, asyncapi } = require("@stoplight/spectral-rulesets");

import {extractPatternIdsToApply, extractFiles} from "./configExtractor"

export const engineImpl: Engine = async function (
  codacyrc?: Codacyrc
): Promise<ToolResult[]> {

  const codacyrcFiles = await extractFiles(codacyrc)
  const patternIdsToApply = await extractPatternIdsToApply(codacyrc)

  const defaultAsyncapiRules = {...asyncapi.rules}
  const defaultOasRules = {...oas.rules}

  if (patternIdsToApply?.length) {
    for (let defaultRuleKey in defaultAsyncapiRules) {
      if ( !patternIdsToApply.includes(defaultRuleKey) ) {
        delete defaultAsyncapiRules[defaultRuleKey]
      }
    }
    for (let defaultRuleKey in defaultOasRules) {
      if ( !patternIdsToApply.includes(defaultRuleKey) ) {
        delete defaultOasRules[defaultRuleKey]
      }
    }
  }

  const asyncapiSpectral = new Spectral();
  asyncapiSpectral.setRuleset(new Ruleset( { rules: defaultAsyncapiRules } ))

  const oasSpectral = new Spectral();
  oasSpectral.setRuleset(new Ruleset( { rules: defaultOasRules } ))

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
      return extension === "json" ? oasSpectral.run(new Document(file[1], Json, filename)) : asyncapiSpectral.run(new Document(file[1], Yaml, filename))
    }).flat()
  )

  return convertResults(
      spectralResults.flat()
  )
}
