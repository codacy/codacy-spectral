# oas3-callbacks-in-callbacks

A callback should not be defined within another callback.

**Recommended:** Yes

**Default severity when enabled:** warn

**Bad Example**

```yaml
paths:
  /path:
    get:
      callbacks:
        onData:
          /data:
            post:
              callbacks: ...
```
