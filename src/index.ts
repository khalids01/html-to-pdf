import { Elysia, t } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { staticPlugin } from "@elysiajs/static";

import { pdfRoute } from "./routes/pdf";
import { resumeRoute } from "./routes/resume";
import { resumePdfRoute } from "./routes/resume-pdf";

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app = new Elysia()

  // ── OpenAPI / Scalar docs at /docs ──────────────────────────────────────
  .use(
    openapi({
      path: "/docs",
      documentation: {
        info: {
          title: "html2pdf API",
          version: "1.0.0",
          description:
            "A professional-grade HTML → PDF microservice built with **Bun** and **Elysia**.\n\n" +
            "### Features\n" +
            "- Convert any **public URL** to a pixel-perfect PDF via Playwright\n" +
            "- Convert **raw HTML strings** to PDF\n" +
            "- Smart **filesystem cache** to avoid redundant browser launches\n" +
            "- Download your **resume** as a beautifully rendered PDF\n\n" +
            "### How it works\n" +
            "1. A headless **Chromium** browser is launched (singleton, reused across requests)\n" +
            "2. `page.emulateMedia({ media: 'print' })` is called so `@media print` CSS fires\n" +
            "3. The page navigates and waits for `networkidle` (all fonts / images loaded)\n" +
            "4. `page.pdf()` captures an A4 PDF with zero margins so your layout controls spacing\n" +
            "5. The PDF is cached on disk; subsequent requests for the same resource are instant",
          contact: {
            name: "html2pdf",
            url: "https://github.com/khalid/html2pdf",
          },
        },
        tags: [
          {
            name: "PDF",
            description:
              "Convert URLs or raw HTML to PDF files using headless Chromium",
          },
          {
            name: "Resume",
            description:
              "View and download the developer resume as HTML or PDF",
          },
          {
            name: "Health",
            description: "Service health and metadata",
          },
        ],
      },
      scalar: {
        darkMode: true,
      },
    }),
  )

  // ── Static files (public/) ───────────────────────────────────────────────
  .use(staticPlugin({ prefix: "/" }))

  // ── Health ───────────────────────────────────────────────────────────────
  .get(
    "/",
    () => ({
      service: "html2pdf",
      version: "1.0.0",
      status: "ok",
      docs: "/docs",
      endpoints: {
        resume_html: "/resume",
        resume_pdf: "/resume.pdf",
        pdf_from_url: "/pdf/from-url?url=<url>",
        pdf_from_html: "POST /pdf/from-html",
      },
    }),
    {
      detail: {
        summary: "Health check",
        description: "Returns service status and a map of available endpoints.",
        tags: ["Health"],
      },
    },
  )

  // ── PDF routes ───────────────────────────────────────────────────────────
  .use(pdfRoute)

  // ── Resume HTML ──────────────────────────────────────────────────────────
  .use(resumeRoute)

  // ── Resume PDF ───────────────────────────────────────────────────────────
  .use(resumePdfRoute)

  // ── Start ────────────────────────────────────────────────────────────────
  .listen(3000);

console.log(
  `🦊 html2pdf running at  http://${app.server?.hostname}:${app.server?.port}`,
);
console.log(
  `📚 API docs at          http://${app.server?.hostname}:${app.server?.port}/docs`,
);
console.log(
  `📄 Resume HTML at       http://${app.server?.hostname}:${app.server?.port}/resume`,
);
console.log(
  `🖨  Resume PDF at        http://${app.server?.hostname}:${app.server?.port}/resume.pdf`,
);

export type App = typeof app;
