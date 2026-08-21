const secretKey = process.env.PDF_SERVICE_SECRET_KEY?.trim();

if (!secretKey) {
  throw new Error("PDF_SERVICE_SECRET_KEY is required");
}

export function isAuthorized(request: Request) {
  return request.headers.get("authorization") === `Bearer ${secretKey}`;
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
