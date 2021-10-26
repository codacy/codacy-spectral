# path-params

Path parameters are correct and valid.

1. For every parameters referenced in the path string (i.e: `/users/{userId}`), the parameter must be defined in either
   `path.parameters`, or `operation.parameters` objects (Non standard HTTP operations will be silently ignored.)

2. every `path.parameters` and `operation.parameters` parameter must be used in the path string.

**Recommended:** Yes

