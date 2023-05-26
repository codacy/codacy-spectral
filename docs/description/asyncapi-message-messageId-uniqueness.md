# asyncapi-message-messageId-uniqueness

`messageId` must be unique across all the messages (except those one defined in the components).

**Recommended:** Yes

**Bad Example**

```yaml
channels:
  smartylighting.streetlights.1.0.action.{streetlightId}.turn.on:
    publish:
      message:
        messageId: turnMessage
  smartylighting.streetlights.1.0.action.{streetlightId}.turn.off:
    publish:
      message:
        messageId: turnMessage
```

**Good Example**

```yaml
channels:
  smartylighting.streetlights.1.0.action.{streetlightId}.turn.on:
    publish:
      message:
        messageId: turnOnMessage
  smartylighting.streetlights.1.0.action.{streetlightId}.turn.off:
    publish:
      message:
        messageId: turnOffMessage
```
