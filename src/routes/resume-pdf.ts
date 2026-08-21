import { Elysia, t } from "elysia";
import { clearCacheByPrefix, readCache, writeCache } from "../lib/cache";
import { generatePdfFromUrl } from "../lib/pdf";
import { isAuthorized, unauthorizedResponse } from "../lib/auth";

const layouts = ["ats-standard", "engineering-pro", "senior-compact", "eu-professional", "modern-split"] as const;
const cacheVersion = "resume-renderer-v1";
const portfolioOrigin = process.env.PORTFOLIO_RESUME_ORIGIN?.replace(/\/$/, "");

if (!portfolioOrigin) {
  throw new Error("PORTFOLIO_RESUME_ORIGIN is required");
}

const generateBody = t.Object({
  variant: t.String({ minLength: 1, maxLength: 100, pattern: "^[a-z0-9-]+$" }),
  layout: t.Union(layouts.map((layout) => t.Literal(layout))),
  version: t.String({ minLength: 1, maxLength: 128 }),
});

const invalidateBody = t.Object({
  variant: t.Optional(t.String({ minLength: 1, maxLength: 100, pattern: "^[a-z0-9-]+$" })),
});

function resumeUrl(variant: string, layout: string) {
  const path = variant === "default" ? "/resume" : `/resume/${variant}`;
  return `${portfolioOrigin}${path}?layout=${encodeURIComponent(layout)}`;
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
    const cacheKey = `resume_${body.variant}_${body.layout}_${body.version}_${cacheVersion}`;
    const cached = readCache(cacheKey);
    if (cached.hit && cached.data) return pdfResponse(cached.data, "HIT");

    const pdf = await generatePdfFromUrl({
      url: resumeUrl(body.variant, body.layout),
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      waitUntil: "load",
      extraWaitMs: 500,
    });
    writeCache(cacheKey, pdf);
    return pdfResponse(pdf, "MISS");
  }, { body: generateBody })
  .post("/cache/invalidate", ({ body }) => {
    const cleared = clearCacheByPrefix(body.variant ? `resume_${body.variant}_` : "resume_");
    return { cleared };
  }, { body: invalidateBody });
