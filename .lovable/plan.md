## Goal
Produce a polished, 3-slide PowerPoint presentation that pitches the AI Workplace Productivity Assistant built in this project. The deck will use a Lovable-branded red/pink palette, include app screenshots and the Lovable logo, and end with a QR code + URL for the live app.

## Output
`/mnt/documents/pitch-deck.pptx` (plus QA images under `/tmp`).

## Slide plan

### Slide 1 — Problem & Solution Overview
- **Headline:** AI Workplace Productivity Assistant
- **Subhead:** Built with Lovable + AI in record time
- **Problem statement:** Professionals lose hours drafting emails, juggling tasks, and reading long documents.
- **Solution overview:** One clean SaaS workspace that generates emails, plans the day, and summarizes research with AI.
- **Tools used:** Lovable logo + ChatGPT/OpenAI logo badges.
- **Visual:** Large hero text on warm red/pink gradient, minimal iconography.

### Slide 2 — Demo, Features & Sample Prompts
- **Headline:** How it works
- **Left:** App dashboard screenshot (metric cards, quick actions, recent activity) showing the real interface.
- **Right:** Feature bullets
  - Smart Email Generator
  - AI Task Planner
  - AI Research Assistant
  - Saved outputs & history
- **Sample prompts:**
  - “Draft a polite follow-up email to a client who missed a meeting.”
  - “Plan my day: two meetings, a report, and 30 emails.”
  - “Summarize this article and list 3 action items.”
- **Visual:** Screenshot + rounded cards with prompt examples.

### Slide 3 — Challenges, Impact & Live Demo Link
- **Headline:** Built fast, built smart
- **Challenges & solutions:**
  - Tight submission deadline → Rapid no-code prototyping with Lovable.
  - Limited AI tokens → Optimized structured prompts and strict Zod schemas to reduce retries.
- **Impact:** Faster email drafting, clearer daily prioritization, quicker research insights.
- **Call to action:** “Try the live app” with QR code + URL `https://smart-work-scribe-07.lovable.app`.
- **Visual:** QR code centered, app URL below, Lovable logo watermark.

## Asset list
- **App screenshots:** Capture from the live preview at `http://localhost:8080` and authenticated routes using Playwright (landing page, dashboard, email generator, planner, research assistant). Use the current preview state.
- **Lovable logo:** Fetch via `logo.dev` or the Lovable website; fall back to generating a clean Lovable wordmark if needed.
- **ChatGPT/OpenAI logo:** Fetch via `logo.dev` (`openai.com`).
- **QR code:** Generate server-side (e.g., `qrcode` library or Python) for the published URL.

## Technical approach
1. **Capture screenshots** with Playwright at 1280x720/1280x1800, saved to `/tmp/browser/screenshots/`.
2. **Fetch logos** via `code--fetch_website` or `logo.dev` and save to `/tmp/`.
3. **Generate QR code** using a Python/Node script to `/tmp/qr-code.png`.
4. **Build the deck** with `pptxgenjs` (Node), embedding images as base64 per the PPTX skill.
5. **Visual QA:** Convert PPTX to PDF with LibreOffice, then to slide images with `pdftoppm`; inspect each slide for alignment, contrast, overflow, and image clarity.
6. **Deliver** the final `.pptx` to `/mnt/documents/` with a `<presentation-artifact>` tag.

## Design choices
- **Palette:** Lovable brand red/pink (#FF4F4F, #FF8A8A) on white, with dark text (#1F1F1F) for readability.
- **Typography:** Bold sans-serif titles, 24–32 pt body, 18–20 pt captions.
- **Layout:** Two-column layouts on slides 2–3; generous margins; no accent lines under titles; rounded image frames and cards for consistency with the app UI.

## Assumptions
- The published app URL is `https://smart-work-scribe-07.lovable.app` (from project context).
- The current preview is running at `http://localhost:8080` with the app visible.
- If authenticated routes require a session, I will capture what is publicly visible (landing page) and use the dashboard from the current preview if a session is available; otherwise I will generate a representative dashboard mock from the existing design tokens.