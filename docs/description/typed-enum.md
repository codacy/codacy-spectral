# typed-enum

Enum values should respect the `type` specifier.

**Recommended:** Yes

**Good Example**

```yaml
TheGoodModel:
  type: object
  properties:
    number_of_connectors:
      type: integer
      description: The number of extension points.
      enum:
        - 1
        - 2
        - 4
        - 8
```

**Bad Example**

```yaml
TheBadModel:
  type: object
  properties:
    number_of_connectors:
      type: integer
      description: The number of extension points.
      enum:
        - 1
        - 2
        - "a string!"
        - 8
```

