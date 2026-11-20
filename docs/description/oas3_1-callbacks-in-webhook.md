# oas3_1-callbacks-in-webhook

Callbacks should not be defined in a webhook. Applies to OpenAPI v3.1 and v3.2.

**Recommended:** Yes

**Default severity when enabled:** warn

**Bad Example**

```yaml
webhooks:
  newPet:
    post:
      callbacks: ...
```
