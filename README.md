# Xike (析课)

[中文文档](README.zh-CN.md) | [Development](docs/DEVELOPMENT.md) | [Deployment](docs/DEPLOYMENT.md) | [Samples](samples/README.md)

Xike turns dense university timetable exports into an editable calendar. It accepts Excel, PDF, and image inputs, expands recurring classes into a monthly view, and exports ICS calendars or self-contained HTML.

## Features

- Parse Excel locally, with optional PDF table extraction and multimodal LLM assistance.
- Review, create, update, or remove course events before export.
- Detect time conflicts and support flexible course-period times.
- Export ICS and offline HTML; use the print-friendly calendar view.
- Keep LLM credentials on the server-side proxy in production.

## Architecture

The browser application lives in `index.html`, `script.js`, `llm_parser.js`, and `time_utils.js`. `server_debug.js` is an optional Node.js proxy for authentication, LLM requests, and PDF parsing. The Python service in `pdfplumber-fastapi-service/` extracts tables from PDFs and can run both as a CLI and as FastAPI.

## Quick Start

Prerequisites: Node.js 18+ and Python 3.10+.

```bash
npm ci
python -m pip install -r pdfplumber-fastapi-service/requirements.txt
copy .env.example .env
npm start
```

Open `http://127.0.0.1:3001`. For a local smoke test without login, set `REQUIRE_AUTH=false` in `.env`. Do not use that setting in production.

`LLM_API_KEY`, `AUTH_PASS`, and `JWT_SECRET` must be supplied through environment variables or a local `.env` file. Never commit `.env` or generated `config.js`.

## Project Layout

```text
.
├── docs/                         # English and Chinese project documentation
├── pdfplumber-fastapi-service/   # Optional Python PDF parser
├── samples/                      # Sample policy and candidate files
├── tests/                        # Node.js tests
├── server_debug.js               # Optional Node.js proxy
└── index.html                    # Browser entry point
```

## Documentation Policy

Every reader-facing English Markdown document has a same-named `.zh-CN.md` mirror, and both must be updated in the same commit. Chinese reference PDFs are stored in `docs/reference/`.

## Security

Treat all API keys and passwords as secrets. If a key has ever been stored in a local copy or committed history, rotate it before publishing the repository.

## License

No license has been selected yet. Do not assume permission to reuse or redistribute this project until a license is added.
