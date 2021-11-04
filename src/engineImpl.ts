import { Document, Ruleset, RulesetDefinition,Spectral } from "@stoplight/spectral-core"
import { FileRuleDefinition } from "@stoplight/spectral-core/dist/ruleset/types"
import { Json,Yaml } from "@stoplight/spectral-parsers"
import { asyncapi,oas } from "@stoplight/spectral-rulesets";
import { Codacyrc, Engine, ToolResult } from "codacy-seed"
import { readFile } from "codacy-seed"

import {extractFiles,extractPatternIdsToApply} from "./configExtractor"
import { convertResults } from "./convertResults"

export const engineImpl: Engine = async function (
  codacyrc?: Codacyrc
): Promise<ToolResult[]> {

  const codacyrcFiles = await extractFiles(codacyrc)
  const patternIdsToApply = await extractPatternIdsToApply(codacyrc)

  const spectral = createSpectral(patternIdsToApply ? patternIdsToApply : [])

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
      const document = extension === "json" ? new Document(file[1], Json, filename) : new Document(file[1], Yaml, filename)
      return spectral.run(document)
    }).flat()
  )

  return convertResults(
      spectralResults.flat()
  )

  function createSpectral(rulesToApply: (keyof Ruleset['rules'])[]): Spectral {
    const s = new Spectral();

    if (!rulesToApply.length) {
      s.setRuleset({
        extends: [
          [asyncapi as RulesetDefinition, 'recommended'],
          [oas as RulesetDefinition, 'recommended'],
        ]
      });

      return s;
    }
  
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
