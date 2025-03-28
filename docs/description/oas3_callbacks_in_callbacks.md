# oas3_callbacks_in_callbacks

A callback should not be defined within another callback.

**Recommended:** Yes

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
