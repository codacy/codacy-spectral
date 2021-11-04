# operation-operationId-unique

Every operation must have a unique `operationId`.

Why? A lot of documentation systems use this as an identifier, some SDK generators convert them to a method name, all sorts of things like that.

**Recommended:** Yes

**Bad Example**

```yaml
paths:
  /pet:
    patch:
      operationId: "update-pet"
      responses:
        200:
          description: ok
    put:
      operationId: "update-pet"
      responses:
        200:
          description: ok
```

**Good Example**

```yaml
paths:
  /pet:
    patch:
      operationId: "update-pet"
      responses:
        200:
          description: ok
    put:
      operationId: "replace-pet"
      responses:
        200:
          description: ok
```
