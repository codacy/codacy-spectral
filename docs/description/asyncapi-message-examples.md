# asyncapi-message-examples

All `examples` in message object should follow `payload` and `headers` schemas.

**Bad Example**

```yaml
asyncapi: "2.0.0"
info:
  title: Bad API
  version: "1.0.0"
components:
  messages:
    someMessage:
      payload:
        type: string
      headers:
        type: object
      examples:
        - payload: 2137
          headers: someHeader
```

**Good Example**

```yaml
asyncapi: "2.0.0"
info:
  title: Good API
  version: "1.0.0"
components:
  messages:
    someMessage:
      payload:
        type: string
      headers:
        type: object
      examples:
        - payload: foobar
          headers:
            someHeader: someValue
```

**Recommended:** Yes
