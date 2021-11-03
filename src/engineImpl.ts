import { Codacyrc, Engine, ToolResult } from "codacy-seed"

import { convertResults } from "./convertResults"
import { Spectral, Document, Ruleset } from "@stoplight/spectral-core"
import { migrateRuleset } from '@stoplight/spectral-ruleset-migrator';
import { readFile } from "codacy-seed"
import { Yaml, Json } from "@stoplight/spectral-parsers"
const { oas, asyncapi } = require("@stoplight/spectral-rulesets");
const fs = require("fs")
const configPath = "./.spectral.yaml"

import {extractPatternIdsToApply, extractFiles} from "./configExtractor"

export const engineImpl: Engine = async function (
  codacyrc?: Codacyrc
): Promise<ToolResult[]> {

  const spectral = new Spectral();

  const codacyrcFiles = await extractFiles(codacyrc)
  const patternIdsToApply = await extractPatternIdsToApply(codacyrc)

  const defaultRules = {...oas.rules, ...asyncapi.rules}

  if (patternIdsToApply?.length) {
    for (let defaultRuleKey in defaultRules) {
      if ( !patternIdsToApply.includes(defaultRuleKey) ) {
        delete defaultRules[defaultRuleKey]
      }
    }
  }
    const migratedRuleset = await migrateRuleset(require(configPath), {
                format: 'esm',
                fs,
            });
  console.log(migratedRuleset)
    fs.existsSync(configPath) ? spectral.setRuleset(require(configPath)): spectral.setRuleset(new Ruleset( { rules: defaultRules } ))

    console.log(fs.existsSync(configPath))

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

  return convertResults(
      spectralResults.flat()
  )
}

// export async function getRuleset(rulesetFile: Optional<string>): Promise<Ruleset> {
//     if (rulesetFile === void 0) {
//         return new Ruleset( { rules: {...oas.rules, ...asyncapi.rules} })
//     } else if (!path.isAbsolute(rulesetFile)) {
//         rulesetFile = path.join(process.cwd(), rulesetFile);
//     }
//
//     if (rulesetFile === void 0) {
//         throw new Error(
//             'No ruleset has been found. Please provide a ruleset using the --ruleset CLI argument, or make sure your ruleset file matches .?spectral.(js|ya?ml|json)',
//         );
//     }
//
//     let ruleset: string;
//
//     try {
//         if (isBasicRuleset(rulesetFile)) {
//             const migratedRuleset = await migrateRuleset(rulesetFile, {
//                 format: 'esm',
//                 fs,
//             });
//
//             rulesetFile = path.join(path.dirname(rulesetFile), '.spectral.js');
//
//             ruleset = await bundleRuleset(rulesetFile, {
//                 target: 'node',
//                 format: 'commonjs',
//                 plugins: [
//                     stdin(migratedRuleset, rulesetFile),
//                     builtins(),
//                     // sigh, 2021 and we still do not use ESM
//                     (commonjs as unknown as typeof import('@rollup/plugin-commonjs').default)(),
//                     ...node({ fs, fetch }),
//                 ],
//             });
//         } else {
//             ruleset = await bundleRuleset(rulesetFile, {
//                 target: 'node',
//                 format: 'commonjs',
//                 plugins: [
//                     builtins(),
//                     (commonjs as unknown as typeof import('@rollup/plugin-commonjs').default)(),
//                     ...node({ fs, fetch }),
//                 ],
//             });
//         }
//     } catch (e) {
//         if (!isError(e) || !isErrorWithCode(e) || e.code !== 'UNRESOLVED_ENTRY') {
//             throw e;
//         }
//
//         throw new ErrorWithCause(`Could not read ruleset at ${rulesetFile}.`, { cause: e });
//     }
//
//     return new Ruleset(load(ruleset, rulesetFile), {
//         severity: 'recommended',
//         source: rulesetFile,
//     });
// }