# asyncapi-info-description

AsyncAPI object info `description` must be present and non-empty string.

Examples can contain Markdown so you can really go to town with them, implementing getting started information like where to find authentication keys, and how to use them.

**Recommended:** Yes

**Good Example**

```yaml
asyncapi: "2.0.0"
info:
  version: "1.0.0"
  title: Descriptive API
  description: >+
    Some description about the general point of this API, and why it exists when another similar but different API also exists.
```

