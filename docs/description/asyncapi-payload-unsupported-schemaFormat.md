# asyncapi-payload-unsupported-schemaFormat

AsyncAPI can support various `schemaFormat` values. When unspecified, one of the following will be assumed:

application/vnd.aai.asyncapi;version=2.0.0
application/vnd.aai.asyncapi+json;version=2.0.0
application/vnd.aai.asyncapi+yaml;version=2.0.0

At this point, explicitly setting `schemaFormat` is not supported by Spectral, so if you use it this rule will emit an info message and skip validating the payload.

Other formats such as OpenAPI Schema Object, JSON Schema Draft 07, and Avro will be added in various upcoming versions.

**Recommended:** Yes
