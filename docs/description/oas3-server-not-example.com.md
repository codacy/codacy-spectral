# oas3-server-not-example.com

Server URL should not point at example.com.

**Recommended:** No

**Bad Example**

```yaml
servers:
  - url: https://example.com/api
    description: Production server
  - url: https://staging.example.com/api
    description: Staging server
  - url: http://localhost:3001
    description: Development server
```

We have example.com for documentation purposes here, but you should put in actual domains.
