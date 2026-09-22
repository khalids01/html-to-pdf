import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { createPdfRoute } from "./pdf";

const fakePdf = Buffer.from("%PDF-1.7\nroute-contract-test\n%%EOF\n");

function testApp() {
  return new Elysia().use(
    createPdfRoute({
      generateFromHtml: async () => fakePdf,
      generateFromUrl: async () => fakePdf,
    }),
  );
}

const configuredToken = process.env.PDF_SERVICE_SECRET_KEY ?? "test-secret";

function htmlRequest(body: unknown, token = configuredToken) {
  return new Request("http://localhost/pdf/from-html", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /pdf/from-html", () => {
  test("rejects a missing bearer token", async () => {
    const response = await testApp().handle(
      new Request("http://localhost/pdf/from-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: "<p>test</p>" }),
      }),
    );

    expect(response.status).toBe(401);
  });

  test("rejects an incorrect bearer token", async () => {
    const response = await testApp().handle(htmlRequest({ html: "<p>test</p>" }, "wrong"));
    expect(response.status).toBe(401);
  });

  test("rejects empty HTML", async () => {
    const response = await testApp().handle(htmlRequest({ html: "" }));
    expect(response.status).toBe(422);
  });

  test("returns PDF bytes for valid HTML", async () => {
    const response = await testApp().handle(
      htmlRequest({ html: "<!doctype html><html><body>ok</body></html>", format: "A4", background: true }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    const bytes = Buffer.from(await response.arrayBuffer());
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  });
});
