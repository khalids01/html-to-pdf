import { Elysia, t } from "elysia";
import { buildResumeHtml } from "../lib/resume-html";

/**
 * GET /resume
 * Returns the live HTML resume page.
 * Great for viewing in the browser; also the source for the PDF generator.
 */
export const resumeRoute = new Elysia({ prefix: "/resume" })
  .get(
    "/",
    () => {
      const html = buildResumeHtml();
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    },
    {
      detail: {
        summary: "View HTML resume",
        description:
          "Returns the full, styled HTML resume page. Print-media CSS rules are included so this exact page is used as the source for PDF generation.",
        tags: ["Resume"],
      },
    }
  );
