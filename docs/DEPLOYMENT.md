# Deployment Guide

[中文](DEPLOYMENT.zh-CN.md)

## Production Configuration

Run the Node proxy behind HTTPS and set these environment variables outside the repository:

```text
REQUIRE_AUTH=true
REQUIRE_SAME_ORIGIN=true
AUTH_USER=<administrator name>
AUTH_PASS=<strong password>
JWT_SECRET=<long random secret>
LLM_API_KEY=<provider key>
COOKIE_SECURE=true
ALLOWED_ORIGINS=https://your-domain.example
```

Install Node and Python dependencies during deployment, then start `node server_debug.js` through your process manager. Ensure `PYTHON_BIN` points to the environment containing `pdfplumber`.

## Operational Checks

- Confirm `GET /healthz` succeeds before directing traffic.
- Verify that authenticated PDF and LLM endpoints reject a different origin.
- Set upload limits appropriate to the deployment; `MAX_PDF_BODY_BYTES` defaults to 50 MB.
- Rotate `LLM_API_KEY`, `AUTH_PASS`, and `JWT_SECRET` if any were present in a copied `.env` file.

Never deploy the local recovery archive, `.env`, `config.js`, or dependency directories.
