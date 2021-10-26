# operation-parameters

Operation parameters are unique and non-repeating.

1. Operations must have unique `name` + `in` parameters.
2. Operation cannot have both `in: body` and `in: formData` parameters. (OpenAPI v2.0)
3. Operation must have only one `in: body` parameter. (OpenAPI v2.0)

**Recommended:** Yes

