import { Elysia, t } from "elysia";
import { clearCacheByPrefix, readCache, writeCache } from "../lib/cache";
import { generatePdfFromUrl } from "../lib/pdf";
import { isAuthorized, unauthorizedResponse } from "../lib/auth";

const layouts = ["ats-standard", "engineering-pro", "senior-compact", "eu-professional", "modern-split"] as const;
const densities = ["compact", "standard", "comfortable"] as const;
const pageSizes = ["a4", "letter"] as const;
const cacheVersion = "resume-renderer-v2";
const portfolioOrigin = process.env.PORTFOLIO_RESUME_ORIGIN?.replace(/\/$/, "");

if (!portfolioOrigin) {
  throw new Error("PORTFOLIO_RESUME_ORIGIN is required");
}

const generateBody = t.Object({
  variant: t.String({ minLength: 1, maxLength: 100, pattern: "^[a-z0-9-]+$" }),
  layout: t.Union(layouts.map((layout) => t.Literal(layout))),
  density: t.Union(densities.map((density) => t.Literal(density))),
  pageSize: t.Union(pageSizes.map((pageSize) => t.Literal(pageSize))),
  version: t.String({ minLength: 1, maxLength: 128 }),
});

const invalidateBody = t.Object({
  variant: t.Optional(t.String({ minLength: 1, maxLength: 100, pattern: "^[a-z0-9-]+$" })),
});

function resumeUrl(variant: string, layout: string, density: string, pageSize: string) {
  const path = variant === "default" ? "/resume" : `/resume/${variant}`;
  const query = new URLSearchParams({ layout, density, page: pageSize });
  return `${portfolioOrigin}${path}?${query.toString()}`;
}

function pdfResponse(pdf: Buffer, cache: "HIT" | "MISS") {
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Abdullah_Khalid_Resume.pdf"',
      "Content-Length": pdf.length.toString(),
      "X-Cache": cache,
    },
  });
}

export const resumePdfRoute = new Elysia({ prefix: "/internal/resume" })
  .onBeforeHandle(({ request }) => {
    if (!isAuthorized(request)) return unauthorizedResponse();
  })
  .post("/pdf", async ({ body }) => {
    const cacheKey = `resume_${body.variant}_${body.layout}_${body.density}_${body.pageSize}_${body.version}_${cacheVersion}`;
    const cached = readCache(cacheKey);
    if (cached.hit && cached.data) return pdfResponse(cached.data, "HIT");

    const pdf = await generatePdfFromUrl({
      url: resumeUrl(body.variant, body.layout, body.density, body.pageSize),
      format: body.pageSize === "letter" ? "Letter" : "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      extraWaitMs: 500,
    });
    writeCache(cacheKey, pdf);
    return pdfResponse(pdf, "MISS");
  }, { body: generateBody })
  .post("/cache/invalidate", ({ body }) => {
    const cleared = clearCacheByPrefix(body.variant ? `resume_${body.variant}_` : "resume_");
    return { cleared };
  }, { body: invalidateBody });
