# tag-description

Tags alone are not very descriptive. Give folks a bit more information to work with.

```yaml
tags:
  - name: "Aardvark"
    description: Funny nosed pig-head racoon.
  - name: "Badger"
    description: Angry short-legged omnivores.
```

If your tags are business objects then you can use the term to explain them a bit. An 'Account' could be a user account, company information, bank account, potential sales lead, anything. What is clear to the folks writing the document is probably not as clear to others.

```yaml
tags:
  - name: Invoice Items
    description: |+
      Giant long explanation about what this business concept is, because other people _might_ not have a clue!
```

**Recommended:** No
