import { Elysia, t } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { resumePdfRoute } from "./routes/resume-pdf";
import { pdfRoute } from "./routes/pdf";

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
            "An internal, authenticated HTML and resume PDF renderer built with **Bun** and **Elysia**.\n\n" +
            "### Features\n" +
            "- Render approved portfolio resume variants via Playwright\n" +
            "- Render self-contained HTML documents supplied by trusted callers\n" +
            "- Require an internal bearer token for PDF operations\n" +
            "- Persist a filesystem cache to avoid redundant browser launches\n\n" +
            "### How it works\n" +
            "1. A headless **Chromium** browser is launched (singleton, reused across requests)\n" +
            "2. `page.emulateMedia({ media: 'print' })` is called so `@media print` CSS fires\n" +
            "3. The configured portfolio resume page is loaded with print media enabled\n" +
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
            description: "Authenticated internal PDF operations using headless Chromium",
          },
          {
            name: "Resume",
            description: "Render and invalidate approved portfolio resume PDFs",
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

  // ── Health ───────────────────────────────────────────────────────────────
  .get(
    "/",
    () => ({
      service: "html2pdf",
      version: "1.0.0",
      status: "ok",
      docs: "/docs",
      endpoints: {
        html_pdf: "POST /pdf/from-html",
        resume_pdf: "POST /internal/resume/pdf",
        invalidate_resume_cache: "POST /internal/resume/cache/invalidate",
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

  // ── Authenticated portfolio resume PDF routes ─────────────────────────────
  .use(resumePdfRoute)

  // ── Authenticated general HTML/URL PDF routes ─────────────────────────────
  .use(pdfRoute)

  // ── Start ────────────────────────────────────────────────────────────────
  .listen(3000);

console.log(
  `🦊 html2pdf running at  http://${app.server?.hostname}:${app.server?.port}`,
);
console.log(
  `📚 API docs at          http://${app.server?.hostname}:${app.server?.port}/docs`,
);
console.log(
  `🖨  Internal resume PDF at http://${app.server?.hostname}:${app.server?.port}/internal/resume/pdf`,
);
console.log(
  `📄 HTML to PDF at       http://${app.server?.hostname}:${app.server?.port}/pdf/from-html`,
);

export type App = typeof app;
