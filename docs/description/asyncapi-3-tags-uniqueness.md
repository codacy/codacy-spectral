# asyncapi-3-tags-uniqueness

Tags must not have duplicate names (identifiers).

**Recommended:** Yes

**Bad Example**

```yaml
info:
  tags:
    - name: "Badger"
    - name: "Badger"
```

**Good Example**

```yaml
info:
  tags:
    - name: "Aardvark"
    - name: "Badger"
```
