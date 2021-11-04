# no-script-tags-in-markdown

This rule protects against a potential hack, for anyone bringing in description documents from third parties then generating HTML documentation. If one of those third parties does something shady like inject `<script>` tags, they could easily execute arbitrary code on your domain, which if it's the same as your main application could be all sorts of terrible.

**Recommended:** Yes

**Bad Example**

```yaml
openapi: "3.0.2"
info:
  title: 'some title with <script>alert("You are Hacked");</script>',
```
