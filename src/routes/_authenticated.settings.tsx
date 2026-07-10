import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Loader2, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSettings, updateSettings, type UserPreferences } from "@/lib/outputs.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Workplace AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const get = useServerFn(getSettings);
  const upd = useServerFn(updateSettings);
  const qc = useQueryClient();

  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => get() });
  const [state, setState] = useState<UserPreferences | null>(null);
  useEffect(() => { if (data && !state) setState(data); }, [data, state]);

  const save = useMutation({
    mutationFn: (patch: Partial<UserPreferences>) => upd({ data: patch }),
    onSuccess: (fresh) => {
      qc.setQueryData(["settings"], fresh);
      setState(fresh);
      toast.success("Saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!state) return <div className="mx-auto max-w-3xl"><Loader2 className="mx-auto mt-16 h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const set = <K extends keyof UserPreferences>(k: K, v: UserPreferences[K]) => setState({ ...state, [k]: v });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card className="space-y-6 p-6 shadow-soft">
        <Row label="Default email tone">
          <Select value={state.defaultEmailTone} onValueChange={(v) => set("defaultEmailTone", v as UserPreferences["defaultEmailTone"])}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="persuasive">Persuasive</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Default schedule view">
          <Select value={state.defaultScheduleView} onValueChange={(v) => set("defaultScheduleView", v as UserPreferences["defaultScheduleView"])}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="AI output length">
          <Select value={state.aiOutputLength} onValueChange={(v) => set("aiOutputLength", v as UserPreferences["aiOutputLength"])}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Theme">
          <Select value={state.theme} onValueChange={(v) => set("theme", v as UserPreferences["theme"])}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Language">
          <Select value={state.language} onValueChange={(v) => set("language", v)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Email notifications" description="Product updates and tips">
          <Switch checked={state.notifications} onCheckedChange={(v) => set("notifications", v)} />
        </Row>
        <Row label="Private history" description="Keep AI activity out of dashboard previews">
          <Switch checked={state.privateHistory} onCheckedChange={(v) => set("privateHistory", v)} />
        </Row>

        <Button onClick={() => save.mutate(state)} disabled={save.isPending} className="bg-gradient-primary text-primary-foreground">
          {save.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save changes"}
        </Button>
      </Card>
    </div>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
