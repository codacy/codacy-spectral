# oas3_1-callbacks-in-webhook

Callbacks should not be defined in a webhook.

**Recommended:** Yes

**Bad Example**

```yaml
webhooks:
  newPet:
    post:
      callbacks: ...
```
