# openapi-tags-alphabetical

OpenAPI object should have alphabetical `tags`. This will be sorted by the `name` property.

**Recommended:** No

**Bad Example**

```yaml
tags:
  - name: "Badger"
  - name: "Aardvark"
```

**Good Example**

```yaml
tags:
  - name: "Aardvark"
  - name: "Badger"
```

