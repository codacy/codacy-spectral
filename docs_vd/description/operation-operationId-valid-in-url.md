# operation-operationId-valid-in-url

Seeing as operationId is often used for unique URLs in documentation systems, it's a good idea to avoid non-URL safe characters.

**Recommended:** Yes

**Bad Example**

```yaml
paths:
  /pets:
    get:
      operationId: get cats
```

