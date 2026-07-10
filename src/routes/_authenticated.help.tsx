import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, Mail, ListTodo, BookOpen, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/_authenticated/help")({
  head: () => ({ meta: [{ title: "Help & Support — Workplace AI" }] }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <LifeBuoy className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Help & Support</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FeatureCard icon={Mail} title="Emails" text="Compose professional emails with the right tone in seconds." />
        <FeatureCard icon={ListTodo} title="Planner" text="Turn tasks into an optimized daily or weekly schedule." />
        <FeatureCard icon={BookOpen} title="Research" text="Get executive summaries and next steps from any text." />
      </div>

      <Card className="p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">FAQ</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="a">
            <AccordionTrigger>Is my data private?</AccordionTrigger>
            <AccordionContent>Your generated content, history, and saved outputs are visible only to you and are protected by row-level security.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Can I edit AI outputs?</AccordionTrigger>
            <AccordionContent>Yes — every output is fully editable before you copy, download, save, or share.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="c">
            <AccordionTrigger>How accurate are the results?</AccordionTrigger>
            <AccordionContent>AI-generated content may contain inaccuracies. Always review important content before sending or acting on it.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      <Card className="flex gap-3 p-6 shadow-soft">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <h3 className="font-semibold">Responsible AI</h3>
          <p className="text-sm text-muted-foreground">
            AI-generated content is intended to assist users and may occasionally contain inaccuracies. Always review and verify important information before sending emails, making business decisions, or sharing AI-generated content. Users remain responsible for the final content.
          </p>
        </div>
      </Card>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <Card className="p-5 shadow-soft">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </Card>
  );
}
