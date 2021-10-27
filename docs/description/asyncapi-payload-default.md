# asyncapi-payload-default

`default` objects should be valid against the `payload` they decorate.

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
  default:
    value: 17
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
  default:
    value: nope!
```

