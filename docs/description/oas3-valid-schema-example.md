# oas3-valid-schema-example

Examples must be valid against their defined schema. This rule is applied to Schema objects.

**Recommended:** Yes

**Default severity when enabled:** error

**Good Example**

```yaml
schemas:
  Pet:
    title: Pet
    type: object
    properties:
      id:
        type: integer
        example: 123
      name:
        type: string
        example: Bubbles
      petType:
        type: string
        example: dog
    required:
      - id
      - name
      - petType
```

**Bad Example**

This would throw an error since the example value for `petType` is an `integer`, not a `string`.

```yaml
schemas:
  Pet:
    title: Pet
    type: object
    properties:
      id:
        type: integer
        example: 123
      name:
        type: string
        example: Bubbles
      petType:
        type: string
        example: 123
    required:
      - name
      - petType
```
