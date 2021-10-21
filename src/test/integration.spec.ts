import { deepStrictEqual } from "assert"
import { Issue, ToolResult } from "codacy-seed"
import { Spectral, Ruleset, Document } from "@stoplight/spectral-core"
import { oas, asyncapi } from "@stoplight/spectral-rulesets"
import { Yaml, Json } from "@stoplight/spectral-parsers"

import { convertResults } from "../convertResults"

async function checkResults(file: string, filename: string, expected: ToolResult[]) {

  const spectral = new Spectral()

  spectral.setRuleset(new Ruleset({
    extends: [oas, asyncapi]
  }));

    const report = await spectral.run(new Document(file, Yaml, filename))

    const results = convertResults(report)

    deepStrictEqual(results, expected)
}

describe("spectral", () => {
  it("should report missing surrounding line on line after title", async () => {

    const input = 
      {
          "range": {
              "start": {
                  "line": 0,
                  "character": 1
              },
              "end": {
                  "line": 0,
                  "character": 7
              }
          },
          "message": "Invalid symbol",
          "severity": 0,
          "code": "parser",
          "path": [],
          "source": "example.json"
      }
  

    const expected: ToolResult[] = [
      new Issue("example.json", "Invalid symbol", "parser", 0)
    ]

    await checkResults(JSON.stringify(input, null, 4), input.source, expected)
  })
  it("should report missing surrounding line on line before title", async () => {
    const input = 
      {
          "range": {
              "start": {
                  "line": 0,
                  "character": 0
              },
              "end": {
                  "line": 0,
                  "character": 16
              }
          },
          "message": "The provided document does not match any of the registered formats [OpenAPI 2.0 (Swagger), OpenAPI 3.x, OpenAPI 3.0.x, OpenAPI 3.1.x, AsyncAPI 2.x]",
          "code": "unrecognized-format",
          "severity": 1,
          "source": "example.json",
          "path": []
      }
  

    const expected: ToolResult[] = [
      new Issue("example.json", "The provided document does not match any of the registered formats [OpenAPI 2.0 (Swagger), OpenAPI 3.x, OpenAPI 3.0.x, OpenAPI 3.1.x, AsyncAPI 2.x]", "unrecognized-format", 0)
    ]

    await checkResults(JSON.stringify(input, null, 4), input.source, expected)
  })
})
