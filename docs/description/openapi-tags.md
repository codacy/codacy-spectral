# openapi-tags

OpenAPI object should have non-empty `tags` array.

Why? Well, you _can_ reference tags arbitrarily in operations, and definition is optional...

```yaml
/invoices/{id}/items:
  get:
    tags:
      - Invoice Items
```

Defining tags allows you to add more information like a `description`. For more information see [tag-description](#tag-description).

**Recommended:** No

