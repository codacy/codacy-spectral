# oas3-schema

Validate structure of OpenAPI v3 specification.
If OpenAPI 3.1 or 3.2 is used, `jsonSchemaDialect` is not respected and the draft 2020-12 is applied.
If you define your own `jsonSchemaDialect`, you'll most likely want to disable this rule.

**Recommended:** Yes

**Default severity when enabled:** error
