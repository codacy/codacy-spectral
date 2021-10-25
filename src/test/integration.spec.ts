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

  const extension = file[0].substring(filename.lastIndexOf('.') + 1, filename.length) || filename
  const myDocument = extension === "json" ? new Document(file, Json, filename) : new Document(file, Yaml, filename)

  const report = await spectral.run(myDocument)

  const results = convertResults(report)

  deepStrictEqual(results, expected)
}

describe("integration", () => {
  it("should report asyncapi defects", async () => {
    const input = `
    asyncapi: "2.0.0"
    info:
      title: Awesome API
      description: A very well defined API
      version: "1.0"
      contact:
        name: A-Team
        email: a-team@goarmy.com
        url: https://goarmy.com/apis/support
    `
  

    const expected: ToolResult[] = [
      new Issue("example2.yaml", "Object must have required property \"channels\"", "asyncapi-schema", 1),
      new Issue("example2.yaml", "AsyncAPI object must have non-empty \"servers\" object.", "asyncapi-servers", 1),
      new Issue("example2.yaml", "AsyncAPI object must have non-empty \"tags\" array.", "asyncapi-tags", 1),
      new Issue("example2.yaml", "Info object must have \"license\" object.", "asyncapi-info-license", 2)
    ]

    await checkResults(input, "example2.yaml", expected)
  })
  it("should report operation-tags", async () => {

    const input = `
    {
      "swagger": "2.0",
      "info": {
        "version": "1.0.0",
        "title": "Swagger Petstore",
        "description": "A sample API that uses a petstore as an example to demonstrate features in the swagger-2.0 specification",
        "termsOfService": "http://swagger.io/terms/",
        "contact": {
          "name": "Swagger API Team"
        },
        "license": {
          "name": "MIT"
        }
      },
      "host": "petstore.swagger.io",
      "basePath": "/api",
      "schemes": [
        "http"
      ],
      "consumes": [
        "application/json"
      ],
      "produces": [
        "application/json"
      ],
      "paths": {
        "/pets": {
          "get": {
            "description": "Returns all pets from the system that the user has access to",
            "operationId": "findPets",
            "produces": [
              "application/json",
              "application/xml",
              "text/xml",
              "text/html"
            ],
            "parameters": [
              {
                "name": "tags",
                "in": "query",
                "description": "tags to filter by",
                "required": false,
                "type": "array",
                "items": {
                  "type": "string"
                },
                "collectionFormat": "csv"
              },
              {
                "name": "limit",
                "in": "query",
                "description": "maximum number of results to return",
                "required": false,
                "type": "integer",
                "format": "int32"
              }
            ],
            "responses": {
              "200": {
                "description": "pet response",
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/definitions/Pet"
                  }
                }
              },
              "default": {
                "description": "unexpected error",
                "schema": {
                  "$ref": "#/definitions/ErrorModel"
                }
              }
            }
          }
        }
      },
      "definitions": {
        "Pet": {
          "type": "object",
          "allOf": [
            {
              "$ref": "#/definitions/NewPet"
            },
            {
              "required": [
                "id"
              ],
              "properties": {
                "id": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            }
          ]
        },
        "NewPet": {
          "type": "object",
          "required": [
            "name"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "tag": {
              "type": "string"
            }
          }
        },
        "ErrorModel": {
          "type": "object",
          "required": [
            "code",
            "message"
          ],
          "properties": {
            "code": {
              "type": "integer",
              "format": "int32"
            },
            "message": {
              "type": "string"
            }
          }
        }
      }
    }
    `
  

    const expected: ToolResult[] = [
      new Issue("example1.json", "Operation must have non-empty \"tags\" array.", "operation-tags", 28)
    ]

    await checkResults(input, "example1.json", expected)
  })
})
