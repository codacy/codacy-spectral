# operation-success-response

Operation must have at least one `2xx` or `3xx` response. Any API operation (endpoint) can fail, but presumably it is also meant to do something constructive at some point. If you forget to write out a success case for this API, then this rule will let you know.

**Recommended:** Yes

**Bad Example**

```yaml
paths:
  /path:
    get:
      responses:
        418:
          description: teapot
```
