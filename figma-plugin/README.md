# AegisBrand AI - Figma Desktop Plugin
**Team ARKZ (Codex 48 Hackathon — Round 3 Deliverable 1)**

The AegisBrand Figma Plugin allows designers and creative directors to perform in-situ brand compliance, SLA claim verification, and WCAG contrast linting directly within Figma artboards and canvases.

---

## 🚀 Quick Installation Guide (60 Seconds)

1. Open **Figma Desktop** (or Figma in Chrome).
2. Right-click anywhere on the canvas or open the top menu:  
   `Plugins` ➔ `Development` ➔ `Import plugin from manifest...`
3. Browse to this directory and select `manifest.json`.
4. Click `Plugins` ➔ `Development` ➔ `AegisBrand AI - Pre-Publication Governance`.

---

## 🎨 Features
- **Instant Layer Detection**: Automatically extracts copy from selected text nodes or nested frame hierarchies.
- **Sub-Second Linting**: Evaluates copy against enterprise SLA terms, unverified superlatives, and forbidden jargon.
- **1-Click In-Situ Replacement**: Replaces flawed copy directly on the Figma canvas without opening external tabs or deselecting the frame.
- **Universal Connectivity**: Connects to the live AegisBrand API (`https://arkz-aegisbrand.vercel.app/api/verify`) with zero-downtime offline deterministic fallback.
