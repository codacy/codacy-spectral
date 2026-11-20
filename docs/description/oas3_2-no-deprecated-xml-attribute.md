# oas3_2-no-deprecated-xml-attribute

The `xml.attribute` field is deprecated in OpenAPI v3.2. Use `xml.nodeType: attribute` instead.

Only `xml.attribute: true` is flagged. `xml.attribute: false` is not flagged, since it matches the
default `nodeType` behavior and has no corresponding migration action.

**Recommended:** Yes

**Bad Example**

```yaml
components:
  schemas:
    Pet:
      properties:
        name:
          type: string
          xml:
            attribute: true
```

**Good Example**

```yaml
components:
  schemas:
    Pet:
      properties:
        name:
          type: string
          xml:
            nodeType: attribute
```
