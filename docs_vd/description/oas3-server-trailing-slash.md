# oas3-server-trailing-slash

Server URL should not have a trailing slash.

Some tooling forgets to strip trailing slashes off when it's joining the `servers.url` with `paths`, and you can get awkward URLs like `https://example.com/api//pets`. Best to just strip them off yourself.

**Recommended:** Yes

**Good Example**

```yaml
servers:
  - url: https://example.com
  - url: https://example.com/api
```

**Bad Example**

```yaml
servers:
  - url: https://example.com/
  - url: https://example.com/api/
```

