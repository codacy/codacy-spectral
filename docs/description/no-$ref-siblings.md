# no-$ref-siblings

Before OpenAPI v3.1, keywords next to `$ref` were ignored by most tooling, but not all. This leads to inconsistent experiences depending on what combinations of tools are used. As of v3.1 $ref siblings are allowed, so this rule will not be applied.

**Recommended:** Yes

**Bad Example**

```yaml
TheBadModel:
  $ref: "#/components/TheBadModelProperties"
  # This property should be ignored
  example: May or may not show up
```
