
# AI Workplace Productivity Assistant

A responsive SaaS-style web app with three AI features (Smart Email Generator, AI Task Planner, AI Research Assistant), a dashboard, saved outputs, history, and settings. Powered by Lovable AI (default `openai/gpt-5.5`) and Lovable Cloud for auth + persistence.

## Design system

- Palette per spec: Deep Blue `#2563EB` primary, Purple `#7C3AED` secondary, Cyan `#06B6D4` accent, gray `#F8FAFC` background, semantic success/warning/danger tokens. Encoded as `oklch` in `src/styles.css` under `:root` and `.dark`.
- Modern typography (Inter via `<link>` in `__root.tsx`), rounded cards, subtle shadows, soft gradient accents, generous whitespace, smooth transitions.
- Light/dark mode with theme toggle stored in localStorage (read via `useEffect`).

## App shell & routing

TanStack Start file routes under `src/routes/`:

```text
__root.tsx              (providers, head, theme)
_app.tsx                (authenticated layout: sidebar + topbar + <Outlet/>)
_app.index.tsx          -> /            Dashboard
_app.email.tsx          -> /email       Smart Email Generator
_app.planner.tsx        -> /planner     AI Task Planner
_app.research.tsx       -> /research    AI Research Assistant
_app.history.tsx        -> /history
_app.saved.tsx          -> /saved
_app.settings.tsx       -> /settings
_app.help.tsx           -> /help
auth.tsx                -> /auth        Sign in / up
```

Left sidebar (shadcn `Sidebar`, `collapsible="icon"`) with the 8 nav items. Top bar: logo, global search, notifications popover, theme switch, user avatar menu. Mobile: sidebar collapses to sheet via `SidebarTrigger`.

## Dashboard

- Personalized greeting (user's name/email).
- Metric cards: Emails Generated Today, Tasks Planned, Research Summaries, Productivity Score (derived from activity counts this week).
- Quick action buttons linking to each feature.
- Recent Activity list (last 10 items from `activity` table).
- Responsible-AI disclaimer banner.

## Feature 1 — Smart Email Generator (`/email`)

Form fields: recipient, purpose, key points, additional notes, length (short/medium/long), tone (formal/friendly/persuasive), optional company, deadline, CTA. Sends structured prompt to Lovable AI. Output shown in an editable textarea with Copy / Download (.txt) / Regenerate / Save / Share (Web Share API + copy link fallback). Autosave draft to localStorage.

## Feature 2 — AI Task Planner (`/planner`)

Inputs: period (daily/weekly), task list (rows: title, deadline, priority, est. duration), working hours, break preferences, meeting times, focus areas. AI returns structured JSON (via `Output.object` + Zod schema): prioritized tasks, time-block schedule, tips. Rendered as an editable timeline with inline edits, plus Save / Export (.md) / Print.

## Feature 3 — AI Research Assistant (`/research`)

Inputs: topic, pasted article text, optional file upload (PDF/TXT parsed client-side to text; PDF via `pdfjs-dist` dynamic import), summary length (brief/detailed/executive). AI returns structured sections: executive summary, key points, statistics, insights, recommendations, action items. Editable rich sections. Copy / Save / Export / Regenerate.

## Saved Outputs (`/saved`) & History (`/history`)

- Saved: tabs Emails / Task Plans / Research, with search, rename, edit, delete, duplicate, download.
- History: chronological list of all AI runs with date, feature, title, preview, status; actions Reopen / Edit / Regenerate / Delete.

## Settings (`/settings`)

Default email tone, default schedule view, theme, language, notification preferences, privacy toggles, default AI output length. Stored in `user_settings` table.

## Global search

Top-bar `cmd+k` command palette (shadcn `Command`) that queries saved outputs + history by title/content.

## Backend (Lovable Cloud)

Enable Cloud. Tables (all with GRANTs + RLS on `auth.uid() = user_id`):

- `profiles` (id, display_name, avatar_url)
- `user_settings` (user_id PK, json preferences)
- `saved_outputs` (id, user_id, kind: 'email'|'plan'|'research', title, content jsonb, created_at, updated_at)
- `history` (id, user_id, feature, title, preview, status, payload jsonb, created_at)

Auth: email/password via Lovable Cloud (no email confirmation for smoother demo). `_app` layout redirects to `/auth` if signed out.

## AI integration

- Server functions in `src/lib/ai.functions.ts` using `@ai-sdk/openai-compatible` provider helper at `src/lib/ai-gateway.server.ts` (baseURL `https://ai.gateway.lovable.dev/v1`, `Lovable-API-Key` header, `structuredOutputs: true`).
- Model: `openai/gpt-5.5` for all three features. Planner + Research use `Output.object` with Zod schemas; Email returns plain text.
- Each server function uses `requireSupabaseAuth` middleware, writes a `history` row, and returns the result. Handle 429/402 with user-facing toasts.

## Responsive & UX polish

- Skeleton loaders on data fetch, spinner + progress state during AI calls, `sonner` toasts for success/error, confirm dialogs for destructive actions, animated page/card transitions via existing `animate-*` utilities.

## Footer

Present on `_app` layout: Privacy, Terms, Help, Contact, version, copyright, plus the Responsible AI disclaimer.

## Technical notes

- Fonts: Inter loaded via `<link>` in `__root.tsx`; registered in `@theme` as `--font-sans`.
- Colors converted to `oklch` tokens; shadcn tokens mapped in `@theme inline` (already scaffolded).
- Theme toggle uses `useEffect` to read localStorage post-hydration.
- PDF parsing dynamic-imported client-side only.
- All server functions live in `*.functions.ts` (not under `src/server/`).
- Head metadata: real title/description on `__root` and each leaf route.

## Out of scope (v1)

- Real email sending, calendar integration, team collaboration, billing, i18n beyond a language dropdown that only affects UI copy for English.
