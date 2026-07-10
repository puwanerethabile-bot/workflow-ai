import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, BookOpen, Save, Copy, Download, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateResearch } from "@/lib/ai.functions";
import { saveOutput } from "@/lib/outputs.functions";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace AI" },
      { name: "description", content: "Summarize articles, reports, and research in seconds." },
    ],
  }),
  component: ResearchPage,
});

type ResearchResult = Awaited<ReturnType<typeof generateResearch>>;

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [length, setLength] = useState<"brief" | "detailed" | "executive">("brief");
  const [result, setResult] = useState<ResearchResult | null>(null);

  const gen = useServerFn(generateResearch);
  const save = useServerFn(saveOutput);

  const mutation = useMutation({
    mutationFn: () => gen({ data: { topic, content, length } }),
    onSuccess: (r) => setResult(r),
    onError: (e: Error) => toast.error(e.message || "Failed to summarize"),
  });

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("File too large (max 2MB)");
    const text = await file.text();
    setContent(text);
    toast.success(`Loaded ${file.name}`);
  };

  const copy = () => {
    if (!result) return;
    const text = formatResult(result);
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  const download = () => {
    if (!result) return;
    const blob = new Blob([formatResult(result)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const persist = async () => {
    if (!result) return;
    try {
      await save({ data: { kind: "research", title: topic || result.executiveSummary.slice(0, 60), content: result as any } });
      toast.success("Summary saved");
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-5">
      <Card className="p-6 shadow-soft lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent-foreground">
            <BookOpen className="h-4 w-4" />
          </span>
          <h1 className="text-lg font-semibold">AI Research Assistant</h1>
        </div>
        <div className="space-y-4">
          <Field label="Topic (optional)"><Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. GenAI in supply chain" /></Field>
          <Field label="Paste article / notes *">
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} placeholder="Paste the text you want summarized…" />
          </Field>
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-1.5 text-xs hover:bg-accent">
              <Upload className="h-3.5 w-3.5" /> Upload .txt
              <input type="file" accept=".txt,.md,text/plain,text/markdown" className="hidden" onChange={onFile} />
            </label>
            <span className="text-xs text-muted-foreground">{content.length.toLocaleString()} chars</span>
          </div>
          <Field label="Summary length">
            <Select value={length} onValueChange={(v) => setLength(v as typeof length)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="brief">Brief</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="executive">Executive summary</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Button
            onClick={() => (content.length >= 20 ? mutation.mutate() : toast.error("Add at least 20 characters of content"))}
            disabled={mutation.isPending}
            className="w-full bg-gradient-primary text-primary-foreground"
          >
            {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing…</> : "Summarize"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 shadow-soft lg:col-span-3">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Insights</h2>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" onClick={copy} disabled={!result}><Copy className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="outline" onClick={download} disabled={!result}><Download className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="outline" onClick={() => mutation.mutate()} disabled={mutation.isPending || !content}><RefreshCw className="h-3.5 w-3.5" /></Button>
            <Button size="sm" onClick={persist} disabled={!result}><Save className="mr-1.5 h-3.5 w-3.5" /> Save</Button>
          </div>
        </div>

        {mutation.isPending && !result && (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Extracting insights…
          </div>
        )}
        {!mutation.isPending && !result && (
          <div className="grid h-64 place-items-center text-center text-sm text-muted-foreground">
            Paste content and click Summarize to see insights.
          </div>
        )}

        {result && (
          <div className="space-y-5">
            <Section title="Executive summary"><p className="text-sm">{result.executiveSummary}</p></Section>
            <ListSection title="Key points" items={result.keyPoints} />
            {result.statistics.length > 0 && <ListSection title="Important statistics" items={result.statistics} />}
            <ListSection title="Insights" items={result.insights} />
            <ListSection title="Recommendations" items={result.recommendations} />
            <ListSection title="Action items" items={result.actionItems} />
          </div>
        )}
      </Card>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}
function ListSection({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <Section title={title}>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((it, i) => (<li key={i}>{it}</li>))}
      </ul>
    </Section>
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
function formatResult(r: ResearchResult) {
  return `# Executive Summary\n${r.executiveSummary}\n\n## Key Points\n${r.keyPoints.map((x) => `- ${x}`).join("\n")}\n\n## Statistics\n${r.statistics.map((x) => `- ${x}`).join("\n")}\n\n## Insights\n${r.insights.map((x) => `- ${x}`).join("\n")}\n\n## Recommendations\n${r.recommendations.map((x) => `- ${x}`).join("\n")}\n\n## Action Items\n${r.actionItems.map((x) => `- ${x}`).join("\n")}`;
}
