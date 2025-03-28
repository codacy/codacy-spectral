# asyncapi-3-tags-alphabetical

AsyncAPI object should have alphabetical `tags`. This will be sorted by the `name` property.

**Recommended:** No

**Bad Example**

```yaml
info:
  tags:
    - name: "Badger"
    - name: "Aardvark"
```

**Good Example**

```yaml
info:
  tags:
    - name: "Aardvark"
    - name: "Badger"
```

**Recommended:** No
