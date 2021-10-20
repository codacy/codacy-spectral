import { Codacyrc, Engine, ToolResult } from "codacy-seed"

import { convertResults } from "./convertResults"
import { Spectral, Document, Ruleset, RulesetDefinition } from "@stoplight/spectral-core"
import { falsy } from '@stoplight/spectral-functions';
import { readFile } from "codacy-seed"
import {Yaml} from "@stoplight/spectral-parsers"

export const engineImpl: Engine = async function (
  codacyrc?: Codacyrc
): Promise<ToolResult[]> {

  const ruleset: RulesetDefinition = {
    rules: {
      'valid-type': {
        given: '$..type',
        then: {
          function: falsy,
        },
      },
    },
    overrides: [
      {
        files: ['**/*.json#/foo/type'],
        rules: {
          'valid-type': 'info',
        },
      },
      {
        files: ['**/*.json', '**/*.json#/type'],
        rules: {
          'valid-type': 'error',
        },
      },
      {
        files: ['**/*.json#/bar/type'],
        rules: {
          'valid-type': 'off',
        },
      },
      {
        files: ['**/*.json#/bar/type/foo/type'],
        rules: {
          'valid-type': 'hint',
        },
      },
    ],
  };

  const spectral = new Spectral();

  spectral.setRuleset(new Ruleset(ruleset, { source: "./docs/multiple-tests/without-config-file/src/.spectral.json"}));

  console.log("Spectral ruleset" + spectral.ruleset?.rules)

  const files = await Promise.all(
    codacyrc?.files?.map(async (file) => {
      const fileContent = await readFile(file)
      return [file, fileContent.toString()]
    }) || []
  )

  const spectralResults = await Promise.all(
    files.map(file => file[1]).map((fileContent) => {
      const myDocument = new Document(fileContent, Yaml)
      return spectral.run(myDocument)
    }).flat()
    
  )

  const spectralResultsModified = spectralResults.flat()

  console.log("Spectral results" + spectralResultsModified)

  return convertResults(
    spectralResultsModified,
    Object.fromEntries(files)
  )
}
