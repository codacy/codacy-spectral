# asyncapi-server-no-trailing-slash

Server URL should not have a trailing slash.

Some tooling forgets to strip trailing slashes off when it's joining the `servers.url` with `channels`, and you can get awkward URLs like `mqtt://example.com/broker//pets`. Best to just strip them off yourself.

**Recommended:** Yes

**Good Example**

```yaml
servers:
  - url: mqtt://example.com
  - url: mqtt://example.com/broker
```

**Bad Example**

```yaml
servers:
  - url: mqtt://example.com/
  - url: mqtt://example.com/broker/
```
