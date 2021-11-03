import { Codacyrc, Engine, ToolResult } from "codacy-seed"

import { convertResults } from "./convertResults"
import { Spectral, Document, Ruleset, Rule, RulesetDefinition } from "@stoplight/spectral-core"
import { readFile } from "codacy-seed"
import { Yaml, Json } from "@stoplight/spectral-parsers"
import { oas, asyncapi } from "@stoplight/spectral-rulesets";

import {extractPatternIdsToApply, extractFiles} from "./configExtractor"
import { FileRuleDefinition } from "@stoplight/spectral-core/dist/ruleset/types"

export const engineImpl: Engine = async function (
  codacyrc?: Codacyrc
): Promise<ToolResult[]> {

  const codacyrcFiles = await extractFiles(codacyrc)
  const patternIdsToApply = await extractPatternIdsToApply(codacyrc)

  const defaultAsyncapiRules = {...asyncapi.rules}
  const defaultOasRules = {...oas.rules}

  /* let rulesToApply: Record<string, Rule> = {}

  if (patternIdsToApply?.length) {
    for (let defaultRuleKey in defaultAsyncapiRules) {
      if ( patternIdsToApply.includes(defaultRuleKey) ) {
        rulesToApply[defaultRuleKey] = defaultAsyncapiRules[defaultRuleKey]
      }
    }
    for (let defaultRuleKey in defaultOasRules) {
      if ( patternIdsToApply.includes(defaultRuleKey) ) {
        rulesToApply[defaultRuleKey] = defaultOasRules[defaultRuleKey]
      }
    }
  } */

  const spectral = createSpectralWithRules(patternIdsToApply ? patternIdsToApply : [])

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
      return extension === "json" ? spectral.run(new Document(file[1], Json, filename)) : spectral.run(new Document(file[1], Yaml, filename))
    }).flat()
  )

  return convertResults(
      spectralResults.flat()
  )

  function createSpectralWithRules(rulesToApply: (keyof Ruleset['rules'])[]): Spectral {
    const s = new Spectral();
  
    s.setRuleset({
      extends: [
        [asyncapi as RulesetDefinition, 'off'],
        [oas as RulesetDefinition, 'off'],
      ],
      rules: rulesToApply.reduce((obj: Record<string, Readonly<FileRuleDefinition>>, name: string) => {
        obj[name] = true;
        return obj;
      }, {}),
    });
  
    return s;
  }
}
