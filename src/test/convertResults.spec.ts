
import { deepEqual } from "assert"
import { Issue, ToolResult } from "codacy-seed"
import { ISpectralDiagnostic } from "@stoplight/spectral-core"

import { convertResults } from "../convertResults"

describe("convertResults", () => {
  it("should convert a Spectral report into Codacy results", async () => {
    const report: ISpectralDiagnostic[] = [
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
        },
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
    ]

    const results = await convertResults(report)
    const expected: ToolResult[] = [
      new Issue("example.json", "The provided document does not match any of the registered formats [OpenAPI 2.0 (Swagger), OpenAPI 3.x, OpenAPI 3.0.x, OpenAPI 3.1.x, AsyncAPI 2.x]", "unrecognized-format", 0),
      new Issue("example.json", "Invalid symbol", "parser", 0),
    ]

    deepEqual(results, expected)
  })
})