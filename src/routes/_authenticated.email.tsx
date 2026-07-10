import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, Download, RefreshCw, Save, Share2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEmail } from "@/lib/ai.functions";
import { saveOutput } from "@/lib/outputs.functions";

export const Route = createFileRoute("/_authenticated/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workplace AI" },
      { name: "description", content: "Instantly draft professional workplace emails." },
    ],
  }),
  component: EmailPage,
});

type Form = {
  recipient: string;
  purpose: string;
  keyPoints: string;
  additionalNotes: string;
  length: "short" | "medium" | "long";
  tone: "formal" | "friendly" | "persuasive";
  companyName: string;
  deadline: string;
  callToAction: string;
};

const DEFAULTS: Form = {
  recipient: "",
  purpose: "",
  keyPoints: "",
  additionalNotes: "",
  length: "medium",
  tone: "formal",
  companyName: "",
  deadline: "",
  callToAction: "",
};

function EmailPage() {
  const [form, setForm] = useState<Form>(DEFAULTS);
  const [output, setOutput] = useState("");
  const gen = useServerFn(generateEmail);
  const save = useServerFn(saveOutput);

  const mutation = useMutation({
    mutationFn: (input: Form) => gen({ data: input }),
    onSuccess: (r) => setOutput(r.text),
    onError: (e: Error) => toast.error(e.message || "Failed to generate"),
  });

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipient || !form.purpose) return toast.error("Recipient and purpose are required");
    mutation.mutate(form);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };
  const download = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Email draft", text: output });
      } catch {}
    } else {
      copy();
    }
  };
  const persist = async () => {
    try {
      await save({ data: { kind: "email", title: form.recipient ? `Email to ${form.recipient}` : "Untitled email", content: { text: output, form } } });
      toast.success("Saved to your library");
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-5">
      <Card className="p-6 shadow-soft lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <h1 className="text-lg font-semibold">Smart Email Generator</h1>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Recipient *"><Input value={form.recipient} onChange={(e) => set("recipient", e.target.value)} placeholder="e.g. Sarah, Marketing team" /></Field>
          <Field label="Email purpose *"><Input value={form.purpose} onChange={(e) => set("purpose", e.target.value)} placeholder="Request Q4 report review" /></Field>
          <Field label="Key points"><Textarea value={form.keyPoints} onChange={(e) => set("keyPoints", e.target.value)} placeholder="Bullet points to include" rows={3} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tone">
              <Select value={form.tone} onValueChange={(v) => set("tone", v as Form["tone"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Length">
              <Select value={form.length} onValueChange={(v) => set("length", v as Form["length"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company (optional)"><Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} /></Field>
            <Field label="Deadline (optional)"><Input value={form.deadline} onChange={(e) => set("deadline", e.target.value)} placeholder="e.g. Friday 5pm" /></Field>
          </div>
          <Field label="Call-to-action (optional)"><Input value={form.callToAction} onChange={(e) => set("callToAction", e.target.value)} placeholder="Reply with feedback by…" /></Field>
          <Field label="Additional notes"><Textarea value={form.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)} rows={2} /></Field>
          <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground" disabled={mutation.isPending}>
            {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : <>Generate email</>}
          </Button>
        </form>
      </Card>

      <Card className="flex min-h-[500px] flex-col p-6 shadow-soft lg:col-span-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Generated email</h2>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" onClick={copy} disabled={!output}><Copy className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="outline" onClick={download} disabled={!output}><Download className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="outline" onClick={share} disabled={!output}><Share2 className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="outline" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}><RefreshCw className="h-3.5 w-3.5" /></Button>
            <Button size="sm" onClick={persist} disabled={!output}><Save className="mr-1.5 h-3.5 w-3.5" /> Save</Button>
          </div>
        </div>
        {mutation.isPending && !output ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Drafting your email…
          </div>
        ) : (
          <Textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder="Your generated email will appear here — fully editable."
            className="min-h-[400px] flex-1 resize-none font-mono text-sm"
          />
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
