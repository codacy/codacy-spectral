# asyncapi-3-channel-no-trailing-slash

Keep trailing slashes off of channel address, as it can cause some confusion. Most messaging protocols will treat `example/foo` and `example/foo/` as different things. Keep in mind that tooling may replace slashes (`/`) with protocol-specific notation (e.g.: `.` for AMQP), therefore, a trailing slash may result in an invalid channel address in some protocols.

**Recommended:** Yes
