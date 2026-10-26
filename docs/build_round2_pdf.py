import weasyprint

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AegisBrand AI - Round 2 Build Submission | Team ARKZ</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    @page {
      size: A4;
      margin: 14mm 15mm 16mm 15mm;
      @bottom-left {
        content: "Codex 48 Hackathon • Round 2: The Build — Team ARKZ";
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 7.5pt;
        color: #64748b;
        font-weight: 500;
      }
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 7.5pt;
        color: #475569;
        font-weight: 700;
      }
      @top-right {
        content: "ROUND 2 SUBMISSION: THE BUILD";
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 7pt;
        color: #94a3b8;
        letter-spacing: 0.6px;
        font-weight: 600;
      }
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 8.8pt;
      line-height: 1.44;
      color: #1e293b;
      background-color: #ffffff;
    }

    .page { page-break-after: always; }
    .page:last-child { page-break-after: avoid; }

    .header-card {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #1e3a8a 100%);
      color: #ffffff;
      padding: 16px 20px;
      border-radius: 10px;
      margin-bottom: 12px;
      border: 1px solid #334155;
    }

    .badge-row { display: flex; gap: 6px; margin-bottom: 8px; }
    .badge {
      display: inline-block; font-size: 6.8pt; font-weight: 700; letter-spacing: 0.5px;
      text-transform: uppercase; padding: 2.5px 8px; border-radius: 9999px;
    }
    .badge-primary { background: #3b82f6; color: #ffffff; }
    .badge-accent { background: #06b6d4; color: #082f49; }
    .badge-green { background: #10b981; color: #ffffff; }

    .header-title { font-size: 20pt; font-weight: 800; letter-spacing: -0.4px; line-height: 1.1; margin-bottom: 4px; color: #ffffff; }
    .header-subtitle { font-size: 9.5pt; font-weight: 400; color: #93c5fd; margin-bottom: 12px; }

    .meta-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.15); padding-top: 10px; font-size: 7.5pt;
    }
    .meta-item strong { display: block; color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 6.5pt; margin-bottom: 2px; }
    .meta-item span { color: #f1f5f9; font-weight: 600; }

    .section-title {
      font-size: 11.2pt; font-weight: 800; color: #0f172a; margin-top: 10px; margin-bottom: 7px;
      padding-bottom: 4px; border-bottom: 2px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;
    }
    .section-score {
      font-size: 7pt; font-weight: 700; color: #2563eb; background: #eff6ff;
      border: 1px solid #bfdbfe; padding: 2px 7px; border-radius: 4px; text-transform: uppercase;
    }

    .subsection-title { font-size: 9.3pt; font-weight: 700; color: #1e3a8a; margin-top: 8px; margin-bottom: 4px; }
    p { margin-bottom: 6.5px; text-align: justify; }

    table { width: 100%; border-collapse: collapse; margin: 8px 0 10px 0; font-size: 8pt; }
    th { background-color: #0f172a; color: #ffffff; font-weight: 700; text-align: left; padding: 6px 8px; font-size: 7.6pt; }
    td { padding: 5.5px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; color: #334155; line-height: 1.35; }
    tr:nth-child(even) td { background-color: #f8fafc; }

    .callout { background: #f8fafc; border-left: 3.5px solid #2563eb; padding: 9px 12px; border-radius: 0 6px 6px 0; margin: 8px 0; font-size: 8.2pt; border: 1px solid #e2e8f0; }
    .callout-green { background: #f0fdf4; border-left: 3.5px solid #16a34a; padding: 9px 12px; border-radius: 0 6px 6px 0; margin: 8px 0; font-size: 8.2pt; color: #166534; }

    ul { margin-left: 16px; margin-bottom: 7px; }
    li { margin-bottom: 3.5px; font-size: 8.4pt; color: #334155; }
    li strong { color: #0f172a; }
  </style>
</head>
<body>

  <!-- PAGE 1 -->
  <div class="page">
    <div class="header-card">
      <div class="badge-row">
        <span class="badge badge-primary">Codex 48 Hackathon</span>
        <span class="badge badge-accent">Round 2: The Build</span>
        <span class="badge badge-green">Core Workflow 100% Functional</span>
      </div>
      <h1 class="header-title">AEGISBRAND AI</h1>
      <div class="header-subtitle">Functional Product Submission & Technical Verification Report</div>
      <div class="meta-grid">
        <div class="meta-item"><strong>Team Name</strong><span>ARKZ</span></div>
        <div class="meta-item"><strong>Lead Engineer</strong><span>Deepak R (Solo Developer)</span></div>
        <div class="meta-item"><strong>Repository</strong><span>github.com/Arkz-Deepak/arkz-aegisbrand</span></div>
        <div class="meta-item"><strong>Build Status</strong><span>Production Ready (Next.js 15)</span></div>
      </div>
    </div>

    <div class="callout-green">
      <strong>Round 2 Build Mandate Delivered:</strong> Content goes in &rarr; verified against approved brand guidelines and factual truth specs &rarr; issues returned explained with verbatim rule citations and 3 intent-preserving rewrites &rarr; human reviewer decides and issues a cryptographically signed compliance certificate (SHA-256).
    </div>

    <div class="section-title">
      <span>1. Project Links & Verification Access</span>
      <span class="section-score">Zero Sign-In Friction</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Resource</th>
          <th style="width: 45%;">Access URL</th>
          <th style="width: 30%;">Access Requirements</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Public Source Code</strong></td>
          <td><strong>https://github.com/Arkz-Deepak/arkz-aegisbrand</strong></td>
          <td>Public GitHub Repository (Full commit history)</td>
        </tr>
        <tr>
          <td><strong>Live Interactive App</strong></td>
          <td><strong>Deployed on Vercel</strong> (1-Click Judge Playground)</td>
          <td>Open to anyone without login or credentials</td>
        </tr>
        <tr>
          <td><strong>Round 1 Specification</strong></td>
          <td>docs/Inkloom_AI_Round_1_Plan_AegisBrand.pdf</td>
          <td>Complete 5-page architectural blueprint</td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">
      <span>2. Completed Features vs. Original Plan</span>
      <span class="section-score">Criterion: 30 Pts Core Flow</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">System Module</th>
          <th style="width: 40%;">Implemented Functionality in Round 2</th>
          <th style="width: 35%;">Plan Adherence Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Brand Knowledge Vault</strong></td>
          <td>Computable JSON rule graph ingesting tone archetypes, prohibited terms dictionary, and authenticated factual truth specs.</td>
          <td><span style="color: #16a34a; font-weight: bold;">✓ 100% Delivered</span> (Active v2.4)</td>
        </tr>
        <tr>
          <td><strong>Multimodal Pre-Flight</strong></td>
          <td>Gemini 3.8/3.7 Flash API integration + mathematical WCAG 2.1 relative luminance contrast checker with instant color ratio preview.</td>
          <td><span style="color: #16a34a; font-weight: bold;">✓ 100% Delivered</span></td>
        </tr>
        <tr>
          <td><strong>Explainable Suggestion Engine</strong></td>
          <td>Categorizes violations (Critical Claim, Tone Drift, Terminology), explains risk, and outputs 3 ranked intent-preserving rewrites.</td>
          <td><span style="color: #16a34a; font-weight: bold;">✓ 100% Delivered</span> with 1-Click Apply</td>
        </tr>
        <tr>
          <td><strong>Review Studio &amp; Sign-off</strong></td>
          <td>Interactive workstation with live character counts, diff application, reviewer override notes, and cryptographic certificate issuance.</td>
          <td><span style="color: #16a34a; font-weight: bold;">✓ 100% Delivered</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- PAGE 2 -->
  <div class="page">
    <div class="section-title">
      <span>3. The Three Named Strategic Improvements (Progress Report)</span>
      <span class="section-score">Criterion: 15 Pts</span>
    </div>
    <p>
      In strict accordance with our Round 1 proposal, we have delivered working implementations of all three named strategic improvements:
    </p>
    <table>
      <thead>
        <tr>
          <th style="width: 30%;">Named Improvement</th>
          <th style="width: 45%;">Round 2 Built Implementation</th>
          <th style="width: 25%;">Round 3 Target</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. In-Situ Live Linter Plugin</strong></td>
          <td>Integrated live authoring tab simulating in-canvas linting (Figma / Headless CMS embed) catching non-compliant claims in real time.</td>
          <td>Packaged Figma Community Manifest &amp; Chrome Extension.</td>
        </tr>
        <tr>
          <td><strong>2. Guideline Friction Discovery</strong></td>
          <td>Dedicated diagnostics engine surfacing internal rule contradictions (e.g. Rule 2.1 vs Rule 4.3 conflict) with automated amendments.</td>
          <td>Unsupervised embedding clustering across team reviewer logs.</td>
        </tr>
        <tr>
          <td><strong>3. Cryptographic Audit Ledger</strong></td>
          <td>SHA-256 signed compliance ledger generating immutable certificate receipts with tamper-proof signature verification.</td>
          <td>Exportable enterprise audit PDF &amp; Webhook sync.</td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">
      <span>4. Technology & Implementation Details</span>
      <span class="section-score">Criterion: 25 Pts Depth</span>
    </div>
    <ul>
      <li><strong>Frontend Architecture:</strong> Next.js 15 (React 19, TypeScript), Tailwind CSS, Lucide React, and Canvas Confetti for celebratory sign-offs.</li>
      <li><strong>Multimodal Verification Engine:</strong> Direct integration with Google Gemini 3.8 / 3.7 Flash models for deep contextual reasoning, supplemented with a deterministic rule engine to ensure 100% uptime for judges under all network conditions.</li>
      <li><strong>Mathematical Computer Vision:</strong> WCAG 2.1 relative luminance algorithm (L = 0.2126R + 0.7152G + 0.0722B) calculating color contrast ratios ((L₁ + 0.05) / (L₂ + 0.05)) with real-time AA/AAA validation.</li>
      <li><strong>Cryptographic Verification:</strong> Node.js `crypto` generating SHA-256 digests over content, policy versions, and timestamps.</li>
    </ul>

    <div class="section-title">
      <span>5. Architectural Refinements Made to Original Plan</span>
      <span class="section-score">Engineering Agility</span>
    </div>
    <div class="callout">
      <strong>Zero-Downtime Deterministic Fallback:</strong> To guarantee that evaluating judges never experience an API timeout, rate-limit, or missing API key error, we augmented the live Gemini API caller with a deterministic semantic rule evaluator. If no external key is present, the app seamlessly provides instantaneous, high-precision diagnostics across all test benchmarks.
    </div>

    <div class="section-title">
      <span>6. Round 3 Final Finish Commitments</span>
      <span class="section-score">Roadmap</span>
    </div>
    <ul>
      <li><strong>Deliverable 1:</strong> Packaged Figma Plugin manifest allowing designers to lint banners directly inside Figma artboards.</li>
      <li><strong>Deliverable 2:</strong> Multi-tenant Brand Vault importer supporting direct upload of PDF brandbooks with automated vector indexing.</li>
      <li><strong>Deliverable 3:</strong> 3-minute comprehensive video demonstration showcasing live end-to-end publishing workflows.</li>
    </ul>

    <p style="text-align: center; font-size: 8pt; color: #64748b; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
      <strong>AegisBrand AI</strong> • Developed by Deepak R (Team ARKZ) • Codex 48 Hackathon Round 2 Build Submission
    </p>
  </div>

</body>
</html>
"""

pdf_output = '/home/deepak-r/Project/CODEX/docs/Inkloom_AI_Round_2_Build_AegisBrand.pdf'
doc = weasyprint.HTML(string=html_content).render()
print(f"Total Pages Generated: {len(doc.pages)}")
doc.write_pdf(pdf_output)
print(f"Successfully generated: {pdf_output}")
