# oas3-server-variables

This rule ensures that server variables defined in OpenAPI Specification 3 (OAS3) and 3.1 are valid, not unused, and result in a valid URL. Properly defining and using server variables is crucial for the accurate representation of API endpoints and preventing potential misconfigurations or security issues.

**Recommended**: Yes

**Bad Examples**

1. **Missing definition for a URL variable**:

```yaml
servers:
  - url: "https://api.{region}.example.com/v1"
    variables:
      version:
        default: "v1"
```

In this example, the variable **`{region}`** in the URL is not defined within the **`variables`** object.

2. **Unused URL variable:**

```yaml
servers:
  - url: "https://api.example.com/v1"
    variables:
      region:
        default: "us-west"
```

Here, the variable **`region`** is defined but not used in the server URL.

3. **Invalid default value for an allowed value variable**:

```yaml
servers:
  - url: "https://api.{region}.example.com/v1"
    variables:
      region:
        default: "us-south"
        enum:
          - "us-west"
          - "us-east"
```

The default value 'us-south' isn't one of the allowed values in the **`enum`**.

4. **Invalid resultant URL**:

```yaml
servers:
  - url: "https://api.example.com:{port}/v1"
    variables:
      port:
        default: "8o80"
```

Substituting the default value of **`{port}`** results in an invalid URL.

**Good Example**

```yaml
servers:
  - url: "https://api.{region}.example.com/{version}"
    variables:
      region:
        default: "us-west"
        enum:
          - "us-west"
          - "us-east"
      version:
        default: "v1"
```

In this example, both **`{region}`** and **`{version}`** variables are properly defined and used in the server URL. Also, the default value for **`region`** is within the allowed values.
