import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Mail, ListTodo, BookOpen, ArrowRight, ShieldCheck, Zap, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant — Work smarter, faster" },
      {
        name: "description",
        content:
          "One AI-powered platform for professional emails, intelligent day planning, and instant research summaries.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>Workplace AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/auth">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link to="/auth" search={{ mode: "signup" }}>
            <Button className="bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-90">
              Get started
            </Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-soft">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Powered by AI, designed for professionals
        </div>
        <h1 className="mx-auto max-w-3xl text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Your intelligent{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">workplace assistant</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Draft professional emails, plan your day, and summarize research in seconds — all in one clean, secure workspace.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/auth" search={{ mode: "signup" }}>
            <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-90">
              Start free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Mail, title: "Smart Email Generator", desc: "Compose polished emails in the right tone, every time." },
            { icon: ListTodo, title: "AI Task Planner", desc: "Turn a messy to-do list into a realistic day plan." },
            { icon: BookOpen, title: "Research Assistant", desc: "Get executive summaries, insights, and next steps." },
          ].map((f) => (
            <Card key={f.title} className="p-6 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Private by default</span>
          <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4" /> Instant AI drafts</span>
          <span className="inline-flex items-center gap-1.5"><Palette className="h-4 w-4" /> Fully editable outputs</span>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Workplace AI · AI-generated content may contain inaccuracies — always review before sending.
      </footer>
    </div>
  );
}
