# asyncapi-tags-uniqueness

Tags must not have duplicate names (identifiers).

**Recommended:** Yes

**Default severity when enabled:** error

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
