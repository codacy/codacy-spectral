# no-\$ref-siblings

An object exposing a `$ref` property cannot be further extended with additional properties.

**Recommended:** Yes

**Bad Example**

```yaml
TheBadModel:
  $ref: "#/components/TheBadModelProperties"
  examples: # <= This property will be ignored
    an_example:
      name: something
```

