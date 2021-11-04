# oas3-api-servers

OpenAPI `servers` must be present and non-empty array.

**Recommended:** Yes

Share links to any and all servers that people might care about. If this is going to be given to internal people then usually that is localhost (so they know the right port number), staging, and production.

```yaml
servers:
  - url: https://example.com/api
    description: Production server
  - url: https://staging.example.com/api
    description: Staging server
  - url: http://localhost:3001
    description: Development server
```

If this is going out to the world, maybe have production and a general sandbox people can play with.
