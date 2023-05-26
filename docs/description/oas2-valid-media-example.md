# oas2-valid-media-example

Examples must be valid against their defined schema. Common reasons you may see errors are:

- The value used for property examples is not the same type indicated in the schema (`string` vs. `integer`, for example).
- Examples contain properties not included in the schema.

**Recommended:** Yes

For example, if you have a Pet object with an `id` property as type `integer`, and `name` and `petType` properties as type `string`, the `examples` properties type should match the schema:

```yaml
schemas:
  Pet:
    title: Pet
    type: object
    properties:
      id:
        type: integer
      name:
        type: string
      petType:
        type: string
    required:
      - id
      - name
      - petType
```

**Good Example**

```yaml
paths:
  '/pet/{petId}':
    get:
      ...
      responses:
        '200':
          description: Pet Found
          schema:
            $ref: '#/definitions/Pet'
          examples:
            Get Pet Bubbles:
              id: 123
              name: 'Bubbles'
              petType: 'dog'
```

**Bad Example**

This would throw an error since `petType` is an `integer`, not a `string`.

```yaml
paths:
  '/pet/{petId}':
    get:
      ...
      responses:
        '200':
          description: Pet Found
          schema:
            $ref: '#/definitions/Pet'
          examples:
            Get Pet Bubbles:
              id: 123
              name: 'Bubbles'
              petType: 123
```
