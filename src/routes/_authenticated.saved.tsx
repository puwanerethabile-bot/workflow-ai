import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Trash2, Copy as CopyIcon, Download, Search, Bookmark, Mail, ListTodo, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { listSavedOutputs, deleteSavedOutput, duplicateSavedOutput } from "@/lib/outputs.functions";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [{ title: "Saved Outputs — Workplace AI" }] }),
  component: SavedPage,
});

const KIND_LABEL: Record<string, string> = { email: "Emails", plan: "Task Plans", research: "Research" };
const KIND_ICON = { email: Mail, plan: ListTodo, research: BookOpen } as const;

function SavedPage() {
  const list = useServerFn(listSavedOutputs);
  const del = useServerFn(deleteSavedOutput);
  const dup = useServerFn(duplicateSavedOutput);
  const qc = useQueryClient();
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({ queryKey: ["saved"], queryFn: () => list() });

  const filtered = useMemo(() => {
    if (!data) return {} as Record<string, any[]>;
    const q = query.trim().toLowerCase();
    const bucket: Record<string, any[]> = { email: [], plan: [], research: [] };
    for (const row of data) {
      if (q && !row.title.toLowerCase().includes(q)) continue;
      bucket[row.kind]?.push(row);
    }
    return bucket;
  }, [data, query]);

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["saved"] }); toast.success("Deleted"); },
  });
  const duplicate = useMutation({
    mutationFn: (id: string) => dup({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["saved"] }); toast.success("Duplicated"); },
  });

  const download = (row: any) => {
    const text = typeof row.content?.text === "string" ? row.content.text : JSON.stringify(row.content, null, 2);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${row.title.replace(/[^\w]+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Bookmark className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Saved Outputs</h1>
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 w-56 pl-8" placeholder="Search…" />
        </div>
      </div>

      <Tabs defaultValue="email">
        <TabsList>
          {(["email", "plan", "research"] as const).map((k) => (
            <TabsTrigger key={k} value={k}>{KIND_LABEL[k]}</TabsTrigger>
          ))}
        </TabsList>
        {(["email", "plan", "research"] as const).map((k) => {
          const Icon = KIND_ICON[k];
          return (
            <TabsContent key={k} value={k} className="mt-4">
              <Card className="divide-y divide-border shadow-soft">
                {isLoading && <div className="space-y-3 p-4">{[0, 1].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>}
                {!isLoading && (filtered[k]?.length ?? 0) === 0 && (
                  <p className="p-8 text-center text-sm text-muted-foreground">Nothing saved yet.</p>
                )}
                {filtered[k]?.map((row) => (
                  <div key={row.id} className="flex items-start gap-3 p-4">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{row.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Saved {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => download(row)} aria-label="Download"><Download className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => duplicate.mutate(row.id)} aria-label="Duplicate"><CopyIcon className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove.mutate(row.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
