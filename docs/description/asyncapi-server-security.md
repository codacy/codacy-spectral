# asyncapi-server-security

Server `security` values must match a scheme defined in the `components.securitySchemes` object. It also checks if there are `oauth2` scopes that have been defined for the given security.

**Recommended:** Yes

**Good Example**

```yaml
servers:
  production:
    url: test.mosquitto.org
    security:
      - petstore_auth: []
components:
  securitySchemes:
    petstore_auth: ...
```

**Bad Example**

```yaml
servers:
  production:
    url: test.mosquitto.org
    security:
      - not_defined: []
components:
  securitySchemes:
    petstore_auth: ...
```
