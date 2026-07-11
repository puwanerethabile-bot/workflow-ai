# Smart Work Scribe

AI-powered workplace productivity web application designed to help professionals automate everyday work tasks. The platform provides intelligent tools for generating professional emails, planning daily or weekly tasks, and summarising research or articles using AI.

The application features a clean, responsive SaaS-inspired interface that allows users to interact with AI efficiently while maintaining complete control over generated content through editable outputs.

---

## Project Overview

Smart Work Scribe improves workplace productivity by leveraging artificial intelligence to automate repetitive office tasks. It serves as an all-in-one productivity assistant that enables professionals to:

- Generate professional emails in different writing tones
- Create organised daily or weekly work schedules
- Summarise articles, reports, or research topics
- Receive AI-generated insights and recommendations
- Edit, copy, save, and download AI-generated content

The application focuses on usability, accessibility, and responsive design to deliver a seamless experience across desktop, tablet, and mobile devices.

---

## Features Implemented

### Dashboard
- Modern SaaS-style dashboard with personalised greeting
- Responsive layout with sidebar navigation
- Quick access to productivity tools
- Metric cards and recent activity feed
- Professional user interface

### Smart Email Generator
- Generate professional workplace emails from structured inputs
- Multiple writing tones: Formal, Friendly, and Persuasive
- Configurable length: Short, Medium, or Long
- Optional fields for company name, deadline, and call-to-action
- Editable generated email output
- Copy, download, regenerate, save, and share functionality
- Draft autosave to local storage

### AI Task Planner
- Generate daily or weekly work schedules
- Task list input with priority, deadline, and estimated duration
- Working hours, break preferences, meeting times, and focus areas
- AI-generated prioritised task list with rationale
- Time-blocked schedule with tasks, meetings, breaks, and focus blocks
- Actionable productivity tips
- Editable task plan with save, export, and print options

### AI Research Assistant
- Summarise research topics or pasted article text
- Optional PDF and TXT file parsing (client-side)
- Summary length options: Brief, Detailed, or Executive
- Structured AI output with executive summary, key points, statistics, insights, recommendations, and action items
- Editable AI-generated summaries
- Copy, save, export, and regenerate functionality

### Saved Outputs & History
- Save generated emails, task plans, and research summaries
- Tabbed browsing of saved outputs by type
- Search, rename, duplicate, edit, and delete saved items
- Chronological history of all AI interactions
- Reopen, edit, regenerate, and delete history entries

### Settings & Preferences
- Default email tone and AI output length
- Default schedule view
- Theme toggle (light / dark mode)
- Language and notification preferences
- Privacy toggles
- Persistent user settings stored in the backend

### Responsive Design
- Mobile-first, fully responsive layout
- Collapsible sidebar with mobile sheet navigation
- Fluid grids and typography that adapt to all screen sizes
- Touch-friendly controls and accessible components

### Responsible AI
- In-app responsible AI disclaimer
- User controls to review, edit, and approve all AI-generated content before use
- Transparency about AI-generated outputs

---

## Technologies and Tools Used

- **Framework:** [TanStack Start](https://tanstack.com/start/) — full-stack React framework with SSR/SSG and server functions
- **UI Library:** React 19 with TypeScript
- **Styling:** Tailwind CSS v4 with custom OKLch design tokens and light/dark themes
- **Components:** shadcn/ui component system
- **Build Tool:** Vite 7
- **Backend & Auth:** Lovable Cloud (Supabase) — authentication, database, and row-level security
- **AI Integration:** Lovable AI Gateway with `@ai-sdk/openai-compatible` and `ai` SDK
- **AI Model:** `openai/gpt-5.5` for structured and unstructured outputs
- **State & Data:** TanStack Query for server-state management
- **Routing:** TanStack Router file-based routing
- **PDF Parsing:** `pdfjs-dist` (dynamic client-side import)
- **Notifications:** Sonner toasts
- **Icons:** Lucide React
- **Validation:** Zod for input and structured output schemas
- **Development:** Bun package manager, Prettier, ESLint

---

## Setup Instructions

### Access the Live Application

The easiest way to use the app is through the live deployment:

**Published URL:** https://smart-work-scribe-07.lovable.app

No installation or configuration is required. Simply open the link in any modern web browser, sign up or sign in, and start using the productivity tools.

### Run Locally (Development)

If you want to run the project locally for development or customisation:

1. **Clone the repository** and open the project folder in your terminal.

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up environment variables:**
   - The project requires a Lovable API key and Lovable Cloud credentials.
   - These are typically provided by the Lovable platform in the `.env` file.
   - Contact the project owner or Lovable support if you need access to the environment variables.

4. **Run the development server:**
   ```bash
   bun dev
   ```

5. **Open the app:**
   - Navigate to `http://localhost:8080` in your browser.

### Build for Production

To create a production build:

```bash
bun run build
```

The build output will be available in the standard Vite output directory and can be deployed to Lovable Cloud or another compatible hosting platform.

---

## Responsible AI Notice

Smart Work Scribe uses artificial intelligence to generate content. AI outputs are suggestions and should be reviewed, edited, and approved by the user before being used in professional or external communications. The developers are not responsible for any decisions or actions taken based on AI-generated content.
