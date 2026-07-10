import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trash2, History as HistoryIcon, Mail, ListTodo, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { listHistory, deleteHistory } from "@/lib/outputs.functions";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — Workplace AI" }] }),
  component: HistoryPage,
});

const icons = { email: Mail, plan: ListTodo, research: BookOpen } as const;

function HistoryPage() {
  const list = useServerFn(listHistory);
  const del = useServerFn(deleteHistory);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["history"], queryFn: () => list() });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["history"] });
      toast.success("Deleted");
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center gap-2">
        <HistoryIcon className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">History</h1>
      </div>
      <Card className="divide-y divide-border shadow-soft">
        {isLoading && <div className="space-y-3 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
        {!isLoading && (data?.length ?? 0) === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No AI activity yet.</p>
        )}
        {data?.map((r: any) => {
          const Icon = icons[r.feature as keyof typeof icons] ?? HistoryIcon;
          return (
            <div key={r.id} className="flex items-start gap-3 p-4">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium">{r.title}</span>
                  <Badge variant="outline" className="text-xs capitalize">{r.feature}</Badge>
                </div>
                {r.preview && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.preview}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove.mutate(r.id)} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
