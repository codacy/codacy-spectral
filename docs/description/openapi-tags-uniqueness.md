# openapi-tags-uniqueness

OpenAPI object must not have duplicated tag names (identifiers).

**Recommended:** Yes

**Bad Example**

```yaml
tags:
  - name: "Badger"
  - name: "Badger"
```

**Good Example**

```yaml
tags:
  - name: "Aardvark"
  - name: "Badger"
```
