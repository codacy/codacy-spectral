# asyncapi-3-tag-description

Tags alone are not very descriptive. Give folks a bit more information to work with.

```yaml
info:
  tags:
    - name: "Aardvark"
      description: Funny-nosed pig-head raccoon.
    - name: "Badger"
      description: Angry short-legged omnivores.
```

If your tags are business objects then you can use the term to explain them a bit. An 'Account' could be a user account, company information, bank account, potential sales lead, or anything. What is clear to the folks writing the document is probably not as clear to others.

```yaml
info:
  tags:
    - name: Invoice Items
      description: |+
        Giant long explanation about what this business concept is, because other people _might_ not have a clue!
```

**Recommended:** No
