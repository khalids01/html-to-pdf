import { Elysia, t } from "elysia";
import { generatePdfFromUrl, generatePdfFromHtml } from "../lib/pdf";
import { readCache, writeCache } from "../lib/cache";
import { isAuthorized, unauthorizedResponse } from "../lib/auth";

// ---------------------------------------------------------------------------
// Schema validation types
// ---------------------------------------------------------------------------

const urlQuerySchema = t.Object({
  url: t.String({
    description: "Publicly accessible URL to convert to PDF",
    examples: ["https://example.com"],
  }),
  format: t.Optional(
    t.Union(
      [
        t.Literal("A4"),
        t.Literal("Letter"),
        t.Literal("Legal"),
        t.Literal("A3"),
        t.Literal("A5"),
      ],
      { description: "Paper format (default: A4)" }
    )
  ),
  cache: t.Optional(
    t.String({
      description: "Use filesystem cache if available. Pass 'false' to bypass (default: 'true')",
    })
  ),
  background: t.Optional(
    t.String({
      description: "Include CSS backgrounds in PDF. Pass 'false' to disable (default: 'true')",
    })
  ),
  margin: t.Optional(
    t.String({
      description: "Uniform page margin CSS value, e.g. '20px' (default: none)",
    })
  ),
  waitMs: t.Optional(
    t.String({
      description: "Extra milliseconds to wait after networkidle (default: 500)",
    })
  ),
});

const htmlBodySchema = t.Object({
  html: t.String({
    description: "Raw HTML string to convert to PDF",
    minLength: 1,
  }),
  format: t.Optional(
    t.Union(
      [
        t.Literal("A4"),
        t.Literal("Letter"),
        t.Literal("Legal"),
        t.Literal("A3"),
        t.Literal("A5"),
      ],
      { description: "Paper format (default: A4)" }
    )
  ),
  background: t.Optional(
    t.Boolean({ description: "Include CSS backgrounds (default: true)" })
  ),
  margin: t.Optional(
    t.String({
      description: "Uniform page margin CSS value, e.g. '20px'",
    })
  ),
  waitMs: t.Optional(
    t.Number({
      description: "Extra milliseconds to wait (default: 500)",
      minimum: 0,
      maximum: 10000,
    })
  ),
});

// ---------------------------------------------------------------------------
// Helper – send PDF response
// ---------------------------------------------------------------------------

function pdfResponse(buffer: Buffer, filename = "document.pdf"): Response {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "no-store",
    },
  });
}

// ---------------------------------------------------------------------------
// Route group
// ---------------------------------------------------------------------------

type PdfRouteDependencies = {
  generateFromUrl?: typeof generatePdfFromUrl;
  generateFromHtml?: typeof generatePdfFromHtml;
};

export function createPdfRoute({
  generateFromUrl = generatePdfFromUrl,
  generateFromHtml = generatePdfFromHtml,
}: PdfRouteDependencies = {}) {
  return new Elysia({ prefix: "/pdf" })
    .onBeforeHandle(({ request }) => {
      if (!isAuthorized(request)) return unauthorizedResponse();
    })

  /**
   * GET /pdf/from-url
   * Convert any public URL to PDF with smart FS caching.
   */
    .get(
    "/from-url",
    async ({ query }) => {
      const {
        url,
        format = "A4",
        cache,
        background,
        margin,
        waitMs,
      } = query;

      const useCache = cache !== "false";
      const printBackground = background !== "false";
      const extraWaitMs = waitMs ? parseInt(waitMs, 10) : 500;

      const marginValue = margin
        ? { top: margin, right: margin, bottom: margin, left: margin }
        : { top: "0", right: "0", bottom: "0", left: "0" };

      // Attempt cache HIT – keyed on URL + options
      const cacheKey = `url_${Buffer.from(url).toString("base64url").slice(0, 40)}_${format}`;

      if (useCache) {
        const cached = readCache(cacheKey);
        if (cached.hit && cached.data) {
          return pdfResponse(cached.data, "document.pdf");
        }
      }

      // Cache MISS – generate via Playwright
      const pdf = await generateFromUrl({
        url,
        format: format as "A4" | "Letter" | "Legal" | "A3" | "A5",
        printBackground,
        margin: marginValue,
        extraWaitMs,
      });

      if (useCache) writeCache(cacheKey, pdf);

      return pdfResponse(pdf, "document.pdf");
    },
    {
      query: urlQuerySchema,
      detail: {
        summary: "URL → PDF",
        description:
          "Renders a publicly accessible URL in a headless Chromium browser using print-media emulation, then returns the result as an A4 PDF. Responses are cached on the filesystem keyed by URL + options to avoid redundant browser launches.",
        tags: ["PDF"],
      },
    }
  )

  /**
   * POST /pdf/from-html
   * Accept raw HTML in the request body and return a PDF.
   */
    .post(
    "/from-html",
    async ({ body }) => {
      const {
        html,
        format = "A4",
        background = true,
        margin,
        waitMs = 500,
      } = body;

      const marginValue = margin
        ? { top: margin, right: margin, bottom: margin, left: margin }
        : { top: "0", right: "0", bottom: "0", left: "0" };

      const pdf = await generateFromHtml(html, {
        format: format as "A4" | "Letter" | "Legal" | "A3" | "A5",
        printBackground: background,
        margin: marginValue,
        extraWaitMs: waitMs,
      });

      return pdfResponse(pdf, "document.pdf");
    },
    {
      body: htmlBodySchema,
      detail: {
        summary: "HTML → PDF",
        description:
          "Accepts a raw HTML string in the request body, renders it in a headless Chromium browser with print-media emulation, and returns an A4 PDF. No caching is applied since the HTML content is dynamic.",
        tags: ["PDF"],
      },
    }
  );
}

export const pdfRoute = createPdfRoute();
