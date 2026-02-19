# 🖨️ html2pdf

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![Elysia](https://img.shields.io/badge/Elysia-fast-%236366f1.svg?style=for-the-badge)](https://elysiajs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A high-performance, professional-grade **HTML-to-PDF microservice** built with [Bun](https://bun.sh) and [Elysia](https://elysiajs.com). It leverages [Playwright](https://playwright.dev) for pixel-perfect rendering and includes a smart caching layer for near-instant responses.

---

## ✨ Features

- 🎯 **Pixel-Perfect Rendering** – Uses headless Chromium via Playwright to ensure what you see in the browser is what you get in the PDF.
- ⚡ **Turbocharged Performance** – Built on Bun's ultra-fast runtime with a custom file-system caching layer.
- 🛠️ **Developer Friendly** – Auto-generated, interactive **API Documentation** at `/docs` using Scalar.
- 📝 **Dual Input** – Convert either a public **URL** or raw **HTML strings**.
- 🎨 **Print-Ready** – Automatically handles `@media print` CSS rules and removes browser UI elements.
- 🚀 **Zero Config** – Sensible defaults for A4 format, backgrounds, and margins.

---

## 🛠️ Tech Stack

- **Runtime:** [Bun](https://bun.sh) (Ultra-fast JS runtime)
- **Framework:** [ElysiaJS](https://elysiajs.com) (Type-safe web framework)
- **PDF Engine:** [Playwright](https://playwright.dev) (Headless Chromium)
- **Docs:** [@elysiajs/openapi](https://elysiajs.com/plugins/openapi.html) (Scalar UI)

---

## 🏗️ How It Works

1.  **Request received:** You send a URL or HTML to the endpoint.
2.  **Cache Check:** The system checks `tmp/pdf-cache/` for a recent snapshot.
3.  **Browser Launch:** If missing/stale, a singleton headless **Chromium** instance is invoked.
4.  **Print Emulation:** Playwright calls `page.emulateMedia({ media: 'print' })`.
5.  **Rendering:** Navigates to the source and waits for `networkidle` to ensure all fonts and images are loaded.
6.  **Capture:** Generates an A4 PDF with your custom margin settings.
7.  **Serve & Cache:** The PDF is saved to disk and streamed to the client.

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your machine.
- macOS or Linux (Playwright dependencies required).

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/html2pdf.git
cd html2pdf

# Install dependencies
bun install

# Install Playwright browser
bun x playwright install chromium
```

### Development

```bash
bun run dev
```

The server will start at `http://localhost:3000`.

---

## 📖 API Reference

### 1. View Documentation

Visit `http://localhost:3000/docs` for the interactive Scalar UI.

### 2. URL to PDF

**`GET /pdf/from-url?url=<url>&format=A4&cache=true`**
Convert any public website to a PDF.

```bash
curl "http://localhost:3000/pdf/from-url?url=https://google.com" -o output.pdf
```

### 3. HTML to PDF

**`POST /pdf/from-html`**
Convert raw HTML strings into a PDF document.

```bash
curl -X POST http://localhost:3000/pdf/from-html \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Hello from html2pdf</h1>", "format":"A4"}' \
  -o result.pdf
```

### 4. Direct Resume Access

- **`GET /resume`** – View the styled HTML resume.
- **`GET /resume.pdf`** – Download the professional-grade cached PDF.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">Made with ❤️ for the Developer Community</p>
