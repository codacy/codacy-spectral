# asyncapi-3-tags

AsyncAPI object should have non-empty `tags` array.

Why? Well, you _can_ reference tags arbitrarily in operations, and definition is optional...

```yaml
invoicedItems:
  address: /invoices/{id}/items
  tags:
    - Invoice Items
```

Defining tags allows you to add more information like a `description`. For more information see [asyncapi-3-tag-description](#asyncapi-3-tag-description).

**Recommended:** Yes
