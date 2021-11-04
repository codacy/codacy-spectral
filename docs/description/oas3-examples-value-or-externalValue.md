# oas3-examples-value-or-externalValue

Examples for `requestBody` or response examples can have an `externalValue` or a `value`, but they cannot have both.

**Recommended:** Yes

**Bad Example**

```yaml
paths:
  /pet:
    put:
      operationId: "replace-pet"
      requestBody:
        content:
          "application/json":
            examples:
              foo:
                summary: A foo example
                value: { "foo": "bar" }
                externalValue: "http://example.org/foo.json"
                # marp! no, can only have one or the other
```
