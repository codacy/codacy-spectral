# asyncapi-3-server-no-trailing-slash

Server host should not have a trailing slash.

Some tooling forgets to strip trailing slashes off when it's joining the `servers.host` with `channels`, and you can get awkward URLs like `mqtt://example.com//pets`. Best to just strip them off yourself.

**Recommended:** Yes

**Good Example**

```yaml
servers:
  - host: mqtt://example.com
```

**Bad Example**

```yaml
servers:
  - host: mqtt://example.com/
  - host: mqtt://example.com/broker/
```
