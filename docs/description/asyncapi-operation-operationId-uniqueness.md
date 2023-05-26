# asyncapi-operation-operationId-uniqueness

`operationId` must be unique across all the operations (except the ones defined in the components).

**Recommended:** Yes

**Bad Example**

```yaml
channels:
  smartylighting.streetlights.1.0.action.{streetlightId}.turn.on:
    publish:
      operationId: turn
  smartylighting.streetlights.1.0.action.{streetlightId}.turn.off:
    publish:
      operationId: turn
```

**Good Example**

```yaml
channels:
  smartylighting.streetlights.1.0.action.{streetlightId}.turn.on:
    publish:
      operationId: turnOn
  smartylighting.streetlights.1.0.action.{streetlightId}.turn.off:
    publish:
      operationId: turnOff
```
