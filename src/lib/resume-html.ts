/**
 * Returns a self-contained HTML string for the resume page.
 * This is the "source of truth" for both the /resume web view and the PDF.
 * Print-specific styles ensure a pixel-perfect A4 PDF.
 */
export function buildResumeHtml(dark = false): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Resume</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />
  <style>
    /* ── Reset ────────────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Root variables ───────────────────────────────────────── */
    :root {
      --accent:  #6366f1;
      --accent2: #06b6d4;
      --text:    #111827;
      --muted:   #6b7280;
      --border:  #e5e7eb;
      --tag-bg:  #eef2ff;
      --tag-fg:  #4f46e5;
      --bg:      #ffffff;
      font-family: 'Inter', system-ui, sans-serif;
    }

    /* ── Print overrides ──────────────────────────────────────── */
    @media print {
      :root { font-size: 11px; }
      body   { background: #fff !important; }
      .no-print { display: none !important; }
      .page-wrap {
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }
    }

    /* ── Base ─────────────────────────────────────────────────── */
    body {
      background: #f9fafb;
      color: var(--text);
      line-height: 1.6;
    }

    /* ── Layout ───────────────────────────────────────────────── */
    .page-wrap {
      max-width: 860px;
      margin: 40px auto;
      padding: 48px 52px;
      background: var(--bg);
      border-radius: 16px;
      box-shadow: 0 4px 40px rgba(0,0,0,.08);
    }

    /* ── Header ───────────────────────────────────────────────── */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      padding-bottom: 28px;
      border-bottom: 2px solid var(--border);
      margin-bottom: 32px;
    }
    .header-left { flex: 1; }
    .name {
      font-size: 2.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.15;
      margin-bottom: 6px;
    }
    .title {
      font-size: 1.05rem;
      color: var(--muted);
      font-weight: 400;
    }
    .contact-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: .82rem;
      color: var(--muted);
      text-align: right;
    }
    .contact-grid a { color: var(--accent); text-decoration: none; }

    /* ── Section ──────────────────────────────────────────────── */
    .section { margin-bottom: 28px; }
    .section-title {
      font-size: .7rem;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    /* ── Summary ──────────────────────────────────────────────── */
    .summary { font-size: .92rem; color: #374151; }

    /* ── Experience ───────────────────────────────────────────── */
    .job { margin-bottom: 22px; }
    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 4px;
    }
    .job-title { font-weight: 600; font-size: .98rem; }
    .job-company { color: var(--accent); font-weight: 500; }
    .job-date { font-size: .78rem; color: var(--muted); white-space: nowrap; }
    .job ul { padding-left: 18px; margin-top: 6px; font-size: .87rem; color: #374151; }
    .job li { margin-bottom: 3px; }

    /* ── Skills ───────────────────────────────────────────────── */
    .skill-group { margin-bottom: 10px; font-size: .87rem; }
    .skill-group-name { font-weight: 600; display: inline; }
    .tags {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-left: 8px;
    }
    .tag {
      background: var(--tag-bg);
      color: var(--tag-fg);
      font-size: .75rem;
      font-weight: 500;
      padding: 2px 10px;
      border-radius: 999px;
    }

    /* ── Education ────────────────────────────────────────────── */
    .edu-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .edu-degree { font-weight: 600; font-size: .95rem; }
    .edu-school { color: var(--accent); font-weight: 500; }
    .edu-date { font-size: .78rem; color: var(--muted); }

    /* ── Projects ─────────────────────────────────────────────── */
    .project { margin-bottom: 16px; }
    .project-title { font-weight: 600; font-size: .95rem; margin-bottom: 3px; }
    .project-desc { font-size: .87rem; color: #374151; }
    .project-link { font-size: .78rem; color: var(--accent2); text-decoration: none; }

    /* ── Action buttons (web-only) ────────────────────────────── */
    .actions {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: .85rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: transform .15s, box-shadow .15s;
    }
    .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(99,102,241,.35); }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: #fff;
    }
    .btn-secondary {
      background: var(--tag-bg);
      color: var(--tag-fg);
    }
  </style>
</head>
<body>
  <!-- Action bar – hidden in print/PDF -->
  <div class="actions no-print" style="max-width:860px;margin:24px auto 0;padding:0 52px;">
    <a href="/" class="btn btn-secondary">← Home</a>
    <a href="/resume.pdf" class="btn btn-primary">
      ⬇ Download PDF
    </a>
  </div>

  <div class="page-wrap">

    <!-- ── Header ── -->
    <header class="header">
      <div class="header-left">
        <h1 class="name">Khalid Al-Amin</h1>
        <p class="title">Full-Stack Developer &amp; Software Engineer</p>
      </div>
      <div class="contact-grid">
        <span>📍 Dhaka, Bangladesh</span>
        <a href="mailto:khalid@example.com">khalid@example.com</a>
        <a href="https://github.com/khalid" target="_blank">github.com/khalid</a>
        <a href="https://linkedin.com/in/khalid" target="_blank">linkedin.com/in/khalid</a>
      </div>
    </header>

    <!-- ── Summary ── -->
    <section class="section">
      <h2 class="section-title">Summary</h2>
      <p class="summary">
        Passionate full-stack developer with 4+ years of experience building
        scalable web applications and APIs. Specialises in TypeScript, React,
        and high-performance backend systems with Bun &amp; Elysia. Obsessed
        with developer experience, clean code, and shipping fast.
      </p>
    </section>

    <!-- ── Experience ── -->
    <section class="section">
      <h2 class="section-title">Experience</h2>

      <div class="job">
        <div class="job-header">
          <div>
            <span class="job-title">Senior Full-Stack Engineer</span>
            <span style="color:var(--muted);margin:0 6px">·</span>
            <span class="job-company">TechCorp Inc.</span>
          </div>
          <span class="job-date">Jan 2023 – Present</span>
        </div>
        <ul>
          <li>Led migration of monolith to micro-services, cutting p99 latency by 40 %.</li>
          <li>Built real-time dashboard with WebSockets serving 50 K concurrent users.</li>
          <li>Mentored a team of 4 junior engineers through code reviews and pair programming.</li>
        </ul>
      </div>

      <div class="job">
        <div class="job-header">
          <div>
            <span class="job-title">Full-Stack Developer</span>
            <span style="color:var(--muted);margin:0 6px">·</span>
            <span class="job-company">StartupXYZ</span>
          </div>
          <span class="job-date">Jun 2021 – Dec 2022</span>
        </div>
        <ul>
          <li>Designed and shipped a SaaS billing platform processing $2 M / month.</li>
          <li>Integrated Stripe, Plaid, and multiple third-party APIs with full TypeScript types.</li>
          <li>Reduced build time 60 % by migrating from Webpack to Vite.</li>
        </ul>
      </div>
    </section>

    <!-- ── Skills ── -->
    <section class="section">
      <h2 class="section-title">Skills</h2>

      <div class="skill-group">
        <span class="skill-group-name">Languages:</span>
        <span class="tags">
          <span class="tag">TypeScript</span>
          <span class="tag">JavaScript</span>
          <span class="tag">Go</span>
          <span class="tag">Python</span>
          <span class="tag">SQL</span>
        </span>
      </div>

      <div class="skill-group">
        <span class="skill-group-name">Frontend:</span>
        <span class="tags">
          <span class="tag">React</span>
          <span class="tag">Next.js</span>
          <span class="tag">Remix</span>
          <span class="tag">TailwindCSS</span>
          <span class="tag">Framer Motion</span>
        </span>
      </div>

      <div class="skill-group">
        <span class="skill-group-name">Backend:</span>
        <span class="tags">
          <span class="tag">Bun</span>
          <span class="tag">Elysia</span>
          <span class="tag">Node.js</span>
          <span class="tag">PostgreSQL</span>
          <span class="tag">Redis</span>
          <span class="tag">Prisma</span>
        </span>
      </div>

      <div class="skill-group">
        <span class="skill-group-name">DevOps:</span>
        <span class="tags">
          <span class="tag">Docker</span>
          <span class="tag">GitHub Actions</span>
          <span class="tag">AWS</span>
          <span class="tag">Vercel</span>
        </span>
      </div>
    </section>

    <!-- ── Projects ── -->
    <section class="section">
      <h2 class="section-title">Projects</h2>

      <div class="project">
        <p class="project-title">html2pdf — HTML → PDF as a Service</p>
        <p class="project-desc">
          A professional-grade Bun + Elysia microservice that renders any URL
          or raw HTML to a pixel-perfect PDF using Playwright. Features a
          file-system caching layer to avoid redundant Chromium launches.
        </p>
        <a class="project-link" href="https://github.com/khalid/html2pdf" target="_blank">
          github.com/khalid/html2pdf
        </a>
      </div>

      <div class="project">
        <p class="project-title">Arbitrage Scanner</p>
        <p class="project-desc">
          Real-time CEX/DEX arbitrage opportunity scanner using WebSockets,
          Jupiter aggregator, and Solana on-chain execution with flash-loan support.
        </p>
      </div>
    </section>

    <!-- ── Education ── -->
    <section class="section">
      <h2 class="section-title">Education</h2>
      <div class="edu-header">
        <div>
          <span class="edu-degree">B.Sc. in Computer Science</span>
          <span style="color:var(--muted);margin:0 6px">·</span>
          <span class="edu-school">University of Dhaka</span>
        </div>
        <span class="edu-date">2017 – 2021</span>
      </div>
    </section>

  </div><!-- /.page-wrap -->
</body>
</html>`;
}
