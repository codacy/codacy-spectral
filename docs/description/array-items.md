# array-items

Schemas with `type: array`, require a sibling `items` field.

**Recommended:** Yes

**Default severity when enabled:** error

**Good Example**

```yaml
TheGoodModel:
  type: object
  properties:
    favoriteColorSets:
      type: array
      items:
        type: array
        items: {}
```

**Bad Example**

```yaml
TheBadModel:
  type: object
  properties:
    favoriteColorSets:
      type: array
      items:
        type: array
```
