import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, ListTodo, Save, Download, Printer, RefreshCw, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { generatePlan } from "@/lib/ai.functions";
import { saveOutput } from "@/lib/outputs.functions";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Workplace AI" },
      { name: "description", content: "Organize your workload with an AI-crafted schedule." },
    ],
  }),
  component: PlannerPage,
});

type PlanResult = Awaited<ReturnType<typeof generatePlan>>;

function PlannerPage() {
  const [period, setPeriod] = useState<"daily" | "weekly">("daily");
  const [tasks, setTasks] = useState("");
  const [workingHours, setWorkingHours] = useState("9:00-17:00");
  const [breakPreferences, setBreakPreferences] = useState("15-min mid-morning, 45-min lunch");
  const [meetings, setMeetings] = useState("");
  const [focusAreas, setFocusAreas] = useState("");
  const [result, setResult] = useState<PlanResult | null>(null);

  const gen = useServerFn(generatePlan);
  const save = useServerFn(saveOutput);

  const mutation = useMutation({
    mutationFn: () => gen({ data: { period, tasks, workingHours, breakPreferences, meetings, focusAreas } }),
    onSuccess: (r) => setResult(r),
    onError: (e: Error) => toast.error(e.message || "Failed to generate plan"),
  });

  const persist = async () => {
    if (!result) return;
    try {
      await save({ data: { kind: "plan", title: `${period === "daily" ? "Daily" : "Weekly"} plan`, content: result as any } });
      toast.success("Plan saved");
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    }
  };

  const exportMd = () => {
    if (!result) return;
    const md = `# ${period === "daily" ? "Daily" : "Weekly"} Plan\n\n${result.summary}\n\n## Prioritized tasks\n${result.prioritized
      .map((t) => `- **[${t.priority}]** ${t.title} (${t.estimatedMinutes} min) — ${t.rationale}`)
      .join("\n")}\n\n## Schedule\n${result.schedule.map((s) => `- **${s.time}** — ${s.activity} _(${s.type})_`).join("\n")}\n\n## Tips\n${result.tips.map((t) => `- ${t}`).join("\n")}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plan-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const priorityColor = (p: string) =>
    p === "high" ? "bg-destructive/10 text-destructive" : p === "medium" ? "bg-warning/15 text-warning-foreground" : "bg-muted text-muted-foreground";

  const typeColor = (t: string) =>
    t === "meeting" ? "bg-secondary/15 text-secondary" : t === "break" ? "bg-success/15 text-success" : t === "focus" ? "bg-accent/15 text-accent-foreground" : "bg-primary/10 text-primary";

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-5">
      <Card className="p-6 shadow-soft lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary/15 text-secondary">
            <ListTodo className="h-4 w-4" />
          </span>
          <h1 className="text-lg font-semibold">AI Task Planner</h1>
        </div>
        <div className="space-y-4">
          <Field label="Planning period">
            <Select value={period} onValueChange={(v) => setPeriod(v as "daily" | "weekly")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tasks *">
            <Textarea
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              rows={6}
              placeholder={"One per line. e.g.\n- Finish Q4 report (due Friday, high)\n- Review 3 PRs\n- 1:1 with Alex"}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Working hours"><Input value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} /></Field>
            <Field label="Meetings"><Input value={meetings} onChange={(e) => setMeetings(e.target.value)} placeholder="10-10:30 standup" /></Field>
          </div>
          <Field label="Break preferences"><Input value={breakPreferences} onChange={(e) => setBreakPreferences(e.target.value)} /></Field>
          <Field label="Focus areas"><Input value={focusAreas} onChange={(e) => setFocusAreas(e.target.value)} placeholder="Product roadmap, deep work" /></Field>
          <Button onClick={() => tasks ? mutation.mutate() : toast.error("Add at least one task")} disabled={mutation.isPending} className="w-full bg-gradient-primary text-primary-foreground">
            {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building plan…</> : "Generate plan"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 shadow-soft lg:col-span-3">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Your optimized plan</h2>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" onClick={() => mutation.mutate()} disabled={mutation.isPending || !result}><RefreshCw className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="outline" onClick={exportMd} disabled={!result}><Download className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="outline" onClick={() => window.print()} disabled={!result}><Printer className="h-3.5 w-3.5" /></Button>
            <Button size="sm" onClick={persist} disabled={!result}><Save className="mr-1.5 h-3.5 w-3.5" /> Save</Button>
          </div>
        </div>

        {mutation.isPending && !result && (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Prioritizing your tasks…
          </div>
        )}
        {!mutation.isPending && !result && (
          <div className="grid h-64 place-items-center text-center text-sm text-muted-foreground">
            Add your tasks on the left to see a scheduled day.
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <p className="rounded-lg bg-muted/50 p-3 text-sm">{result.summary}</p>

            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Zap className="h-4 w-4 text-primary" /> Prioritized tasks</h3>
              <div className="space-y-2">
                {result.prioritized.map((t, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{t.title}</span>
                      <Badge className={priorityColor(t.priority)}>{t.priority}</Badge>
                      <span className="ml-auto text-xs text-muted-foreground">{t.estimatedMinutes} min</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{t.rationale}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Clock className="h-4 w-4 text-primary" /> Schedule</h3>
              <div className="space-y-1.5">
                {result.schedule.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">{s.time}</span>
                    <span className="min-w-0 flex-1 truncate">{s.activity}</span>
                    <Badge className={typeColor(s.type)}>{s.type}</Badge>
                  </div>
                ))}
              </div>
            </section>

            {result.tips.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-semibold">Productivity tips</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {result.tips.map((t, i) => (<li key={i}>{t}</li>))}
                </ul>
              </section>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
