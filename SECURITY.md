# Security Policy

## Reporting a vulnerability

Please do **not** open public issues for security vulnerabilities.

Use GitHub's "Report a vulnerability" button on the Security tab (private advisory), or contact the maintainer directly via the repo profile. Include steps to reproduce and the impact you believe it has. You will receive an acknowledgement within 72 hours.

This is a static, client-side site: the main realistic risks are XSS via injected markup and leaked tokens. Note that no credentials should ever be committed — this repo intentionally ships none.
