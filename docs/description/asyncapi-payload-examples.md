# asyncapi-payload-examples

Values of the `examples` array should be valid against the `payload` they decorate.

**Recommended:** Yes

**Good Example**

```yaml
payload:
  type: object
  properties:
    value:
      type: integer
  required:
    - value
  examples:
    - value: 13
    - value: 17
```

**Bad Example**

```yaml
payload:
  type: object
  properties:
    value:
      type: integer
  required:
    - value
  examples:
    - value: nope! # Wrong type
    - notGoodEither: 17 # Missing required property
```
