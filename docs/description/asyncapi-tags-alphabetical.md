# asyncapi-tags-alphabetical

AsyncAPI object should have alphabetical `tags`. This will be sorted by the `name` property.

**Recommended:** No

**Default severity when enabled:** warn

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

**Recommended:** No
