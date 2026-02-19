# html2pdf

A professional-grade **HTML → PDF** microservice built with [Bun](https://bun.sh) and [Elysia](https://elysiajs.com).

## Features

- 🖨 **URL → PDF** – convert any public URL to a pixel-perfect A4 PDF
- 📝 **HTML → PDF** – POST raw HTML and get a PDF back
- ⚡ **Smart caching** – filesystem cache avoids redundant Chromium launches (instant for repeat requests)
- 📄 **Resume** – built-in HTML resume with a one-click PDF download
- 📚 **API docs** – interactive Scalar docs at `/docs`

## How it works

1. A headless **Chromium** browser is launched via Playwright (singleton, reused across requests)
2. `page.emulateMedia({ media: 'print' })` fires `@media print` CSS rules
3. The page navigates and waits for `networkidle` (fonts, images all loaded)
4. `page.pdf()` captures an A4 PDF – zero margins so _your_ layout controls spacing
5. The PDF is written to `tmp/pdf-cache/` and served instantly on future requests

## Quick start

```bash
bun install
bun run dev
```

Server starts at **http://localhost:3000**.

| URL                           | Description                        |
| ----------------------------- | ---------------------------------- |
| `GET /`                       | Health check + endpoint map        |
| `GET /docs`                   | Interactive Scalar API docs        |
| `GET /resume`                 | HTML resume (web view)             |
| `GET /resume.pdf`             | Resume PDF (smart-cached, 24h TTL) |
| `GET /pdf/from-url?url=<url>` | Convert a public URL to PDF        |
| `POST /pdf/from-html`         | Convert raw HTML body to PDF       |

## API

### `GET /pdf/from-url`

| Query param  | Type                              | Default      | Description                            |
| ------------ | --------------------------------- | ------------ | -------------------------------------- |
| `url`        | string                            | **required** | Public URL to render                   |
| `format`     | A4 \| Letter \| Legal \| A3 \| A5 | `A4`         | Paper size                             |
| `cache`      | string                            | `true`       | Set to `false` to bypass cache         |
| `background` | string                            | `true`       | Set to `false` to skip CSS backgrounds |
| `margin`     | string                            | `0`          | Uniform margin, e.g. `20px`            |
| `waitMs`     | string                            | `500`        | Extra ms to wait after `networkidle`   |

```bash
curl "http://localhost:3000/pdf/from-url?url=https://example.com" -o example.pdf
```

### `POST /pdf/from-html`

```bash
curl -X POST http://localhost:3000/pdf/from-html \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Hello World</h1>","format":"A4"}' \
  -o hello.pdf
```

### `GET /resume.pdf`

Returns the resume as a 24h-cached PDF. Delete `tmp/pdf-cache/resume.pdf` to force regeneration.

## Caching

PDFs are cached at `tmp/pdf-cache/<key>.pdf`. The cache is keyed on the URL + options.

- `/resume.pdf` – 24-hour TTL
- `/pdf/from-url` – indefinite (pass `?cache=false` to bypass)
- `/pdf/from-html` – no caching (content is dynamic)

## Tech stack

|           |                                 |
| --------- | ------------------------------- |
| Runtime   | Bun                             |
| Framework | Elysia                          |
| Browser   | Playwright + Chromium           |
| API docs  | `@elysiajs/openapi` (Scalar UI) |
