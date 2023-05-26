# asyncapi-operation-security

Operation `security` values must match a scheme defined in the `components.securitySchemes` object. It also checks if there are `oauth2` scopes that have been defined for the given security.

**Recommended:** Yes

**Good Example**

```yaml
channels:
  "user/signup":
    publish:
      security:
        - petstore_auth: []
components:
  securitySchemes:
    petstore_auth: ...
```

**Bad Example**

```yaml
channels:
  "user/signup":
    publish:
      security:
        - not_defined: []
components:
  securitySchemes:
    petstore_auth: ...
```
