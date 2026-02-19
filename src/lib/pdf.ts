import { chromium, type Browser } from "playwright-core";

// ---------------------------------------------------------------------------
// Singleton browser management – reuse one Chromium instance across requests
// to avoid the expensive startup cost on every PDF generation.
// ---------------------------------------------------------------------------

let _browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (_browser && _browser.isConnected()) return _browser;

  _browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  // Cleanup on process exit so we don't leave zombie Chromium processes
  _browser.on("disconnected", () => {
    _browser = null;
  });

  return _browser;
}

export interface GeneratePdfOptions {
  /** Full URL of the HTML page to render */
  url: string;
  /** Paper format – default "A4" */
  format?: "A4" | "Letter" | "Legal" | "A3" | "A5";
  /** Whether to include CSS backgrounds (colours, patterns) – default true */
  printBackground?: boolean;
  /** Page margins in CSS syntax, e.g. "20px" – default no margins */
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  /** Extra time (ms) to wait after networkidle before capturing – default 500 */
  extraWaitMs?: number;
}

/**
 * Navigate to `url` with a headless Chromium browser, switch to print-media
 * emulation, then generate and return a PDF as a Buffer.
 */
export async function generatePdfFromUrl(
  opts: GeneratePdfOptions
): Promise<Buffer> {
  const {
    url,
    format = "A4",
    printBackground = true,
    margin = { top: "0", right: "0", bottom: "0", left: "0" },
    extraWaitMs = 500,
  } = opts;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Emulate print media BEFORE navigation so @media print CSS is applied
    await page.emulateMedia({ media: "print" });

    // Navigate and wait until the network has gone idle (fonts, images loaded)
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });

    // Optional extra settle time for web-fonts / JS-driven content
    if (extraWaitMs > 0) {
      await page.waitForTimeout(extraWaitMs);
    }

    const pdfBuffer = await page.pdf({
      format,
      printBackground,
      margin,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

/**
 * Accept raw HTML, render it in a headless browser, and return a PDF Buffer.
 * Useful for self-contained documents that don't require a running server.
 */
export async function generatePdfFromHtml(
  html: string,
  opts: Omit<GeneratePdfOptions, "url"> = {}
): Promise<Buffer> {
  const {
    format = "A4",
    printBackground = true,
    margin = { top: "0", right: "0", bottom: "0", left: "0" },
    extraWaitMs = 500,
  } = opts;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.emulateMedia({ media: "print" });
    await page.setContent(html, { waitUntil: "networkidle", timeout: 30_000 });

    if (extraWaitMs > 0) {
      await page.waitForTimeout(extraWaitMs);
    }

    const pdfBuffer = await page.pdf({
      format,
      printBackground,
      margin,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}
