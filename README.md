# AegisBrand AI 🛡️
> **Intelligent Pre-Publication Brand Governance, Multimodal Verification & Collaborative Alignment Engine**  
> *Developed by Deepak R (Team ARKZ) for Codex 48 Hackathon — Round 2: The Build*

---

## 🚀 Live Demo & Interactive Judge Playground
* **GitHub Repository**: [https://github.com/Arkz-Deepak/arkz-aegisbrand](https://github.com/Arkz-Deepak/arkz-aegisbrand)
* **Round 1 Specification**: [`docs/Inkloom_AI_Round_1_Plan_AegisBrand.pdf`](docs/Inkloom_AI_Round_1_Plan_AegisBrand.pdf)

---

## 📌 Executive Overview
Modern enterprises publish marketing, technical, and commercial collateral at unprecedented velocity (+340%) across distributed staff, external agencies, and generative AI authoring tools. However, brand governance remains tethered to passive 80-page PDF brand manuals that creators rarely consult and slow, asynchronous email/Slack reviews averaging 3.2 business days per asset.

**AegisBrand AI** solves this critical governance bottleneck. Operating as a pre-publication verification platform, it grounds all incoming text, imagery, and multi-page layouts against an authenticated **Brand Knowledge Vault**. Powered by **Google Gemini 3.8/3.7 Flash** alongside mathematical computer vision (WCAG 2.1 contrast & CIELAB color clustering), AegisBrand serves as a collaborative co-pilot: it diagnoses tone drift, unverified claims, outdated facts, visual geometry defects, and accessibility violations, providing verbatim guideline citations and 1-click intent-preserving remediations.

---

## ⚡ 1-Click Interactive Judge Guide
When testing the application, use the **Judge Interactive Demo Toolbar** at the top of the Pre-Flight Studio:
1. **Load Flawed Enterprise Ad**: Loads a realistic launch ad containing:
   - False SLA assertion: *"We guarantee 99.999% uptime with zero exceptions"* (contradicting Enterprise SLA v2026.1 Section 4.2).
   - Prohibited superlative: *"#1 Rated AI Cloud in the World"* (unverified claim).
   - Prohibited terminology: *"cheapest"*, *"bulletproof"*, and *"unlimited"* (violating FTC truth-in-advertising guidelines).
   - Tone drift: *"crazy excited"* and *"crushing it"* (violating authoritative B2B persona).
2. **Click "Run Pre-Flight Inspection"**:
   - Computes overall Brand Adherence Score (0–100) and sub-scores (Tone, Claims, Visual).
   - Surfaces diagnostic cards with verbatim guideline citations and risk assessments.
   - Generates **3 Ranked Intent-Preserving Rewrite Options** (Conservative, Balanced, Creative).
3. **Click "Apply" on any suggestion**:
   - The flawed phrase is dynamically replaced in the editor in real-time.
4. **Click "Approve & Issue Cryptographic Certificate"**:
   - Generates a **SHA-256 Tamper-Proof Compliance Signature** and logs the asset to the immutable Compliance Ledger.

---

## 🌟 The Three Named Strategic Improvements (Round 2 & Round 3)
In strict alignment with our Round 1 Plan and judging criteria, AegisBrand AI delivers three major innovations:
1. **Improvement 1: In-Situ Live Linter (Figma & CMS Embed Simulation)**:
   - Dedicated tab simulating real-time inline linting directly within authoring canvases, catching non-compliant claims and tone drift as you type.
2. **Improvement 2: Algorithmic Guideline Friction & Ambiguity Discovery Engine**:
   - Dedicated tab analyzing reviewer rejection logs and guideline rules to surface conflicting instructions (e.g. Rule 2.1 vs Rule 4.3 contradiction) and propose automated brandbook amendments.
3. **Improvement 3: Cryptographically Verifiable Pre-Publication Audit Ledger**:
   - Dedicated tab maintaining an immutable ledger of all approved assets with SHA-256 signatures, timestamps, and authorized reviewer credentials for regulatory and enterprise compliance.

---

## 🛠️ Production-Grade Tech Stack
* **Frontend**: Next.js 15 (React 19, TypeScript), Tailwind CSS, Lucide React, Canvas Confetti.
* **Backend API**: Next.js App Router API Routes (`/api/verify`, `/api/certify`), Python FastAPI & OpenCV microservices.
* **AI & Language Models**: Google Gemini 3.8 Flash (multimodal vision & style) & Gemini 3.7 Flash (RAG claim verification & structured JSON schemas).
* **Information Retrieval**: Hybrid pgvector + BM25 full-text search against enterprise truth documents.
* **Accessibility**: Mathematical WCAG 2.1 AA/AAA relative luminance contrast algorithms.

---

## 🏃 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/Arkz-Deepak/arkz-aegisbrand.git
cd arkz-aegisbrand

# Install dependencies
npm install

# (Optional) Set your Gemini API key in .env.local
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Team & Submission Information
* **Team Name**: ARKZ
* **Lead Engineer & Full-Stack AI Architect**: Deepak R
* **Event**: Codex 48 (Round 2: The Build)
* **Problem Statement**: Inkloom AI — Intelligent Brand Governance Platform
