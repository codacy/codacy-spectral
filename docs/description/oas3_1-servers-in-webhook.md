# oas3_1-servers-in-webhook

Servers should not be defined in a webhook. Applies to OpenAPI v3.1 and v3.2.

**Recommended:** Yes

**Default severity when enabled:** warn

**Bad Example**

At the path item object level:

```yaml
webhooks:
  servers:
    - url: https://example.com/
    - url: https://example.com/api/
```

or

At the operation level:

```yaml
webhooks:
  newPet:
    post:
      servers:
        -url: https://example.com/
```
