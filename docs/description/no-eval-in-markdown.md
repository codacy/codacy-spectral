# no-eval-in-markdown

This rule protects against an edge case, for anyone bringing in description documents from third parties and using the parsed content rendered in HTML/JS. If one of those third parties does something shady like injecting `eval()` JavaScript statements, it could lead to an XSS attack.

**Recommended:** Yes

**Bad Example**

```yaml
openapi: "3.0.2"
info:
  title: 'some title with eval(',
```
