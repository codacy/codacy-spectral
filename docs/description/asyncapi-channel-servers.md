# asyncapi-channel-servers

Channel servers must be defined in the `servers` object.

**Bad Example**

```yaml
asyncapi: "2.0.0"
info:
  title: Awesome API
  description: A very well-defined API
  version: "1.0"
servers:
  production:
    url: "stoplight.io"
    protocol: "https"
channels:
  hello:
    servers:
      - development
```

**Good Example**

```yaml
asyncapi: "2.0.0"
info:
  title: Awesome API
  description: A very well-defined API
  version: "1.0"
servers:
  production:
    url: "stoplight.io"
    protocol: "https"
channels:
  hello:
    servers:
      - production
```

**Recommended:** Yes
