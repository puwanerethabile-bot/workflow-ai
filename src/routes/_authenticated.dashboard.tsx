import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, ListTodo, BookOpen, Bookmark, Sparkles, TrendingUp, Loader2, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardStats } from "@/lib/outputs.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workplace AI" },
      { name: "description", content: "Your personal productivity overview." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardStats(),
  });

  const name = user.email?.split("@")[0] ?? "there";

  const metrics = [
    { label: "Emails today", value: data?.emails ?? 0, icon: Mail, color: "text-primary" },
    { label: "Plans today", value: data?.plans ?? 0, icon: ListTodo, color: "text-secondary" },
    { label: "Research today", value: data?.research ?? 0, icon: BookOpen, color: "text-accent" },
  ];

  const quick = [
    { label: "Generate email", to: "/email", icon: Mail },
    { label: "Plan my day", to: "/planner", icon: ListTodo },
    { label: "Summarise research", to: "/research", icon: BookOpen },
    { label: "View saved work", to: "/saved", icon: Bookmark },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="text-3xl font-bold capitalize">Hi {name} 👋</h1>
        <p className="mt-1 text-muted-foreground">Here's your productivity snapshot for today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="p-5 shadow-soft transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{m.label}</span>
              <m.icon className={`h-4 w-4 ${m.color}`} />
            </div>
            <div className="mt-2 text-3xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : m.value}</div>
          </Card>
        ))}
        <Card className="p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Productivity score</span>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div className="mt-2 text-3xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-16" /> : `${data?.productivityScore ?? 0}%`}
          </div>
          <Progress value={data?.productivityScore ?? 0} className="mt-3 h-1.5" />
        </Card>
      </div>

      <Card className="overflow-hidden bg-gradient-primary p-6 text-primary-foreground shadow-soft">
        <div className="flex flex-wrap items-center gap-4">
          <Sparkles className="h-6 w-6" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <p className="text-sm text-primary-foreground/80">Jump straight into your next task.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {quick.map((q) => (
            <Link key={q.to} to={q.to}>
              <Button variant="secondary" className="w-full justify-between bg-white/15 text-primary-foreground hover:bg-white/25">
                <span className="inline-flex items-center gap-2"><q.icon className="h-4 w-4" /> {q.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <Button variant="ghost" size="sm" onClick={() => router.navigate({ to: "/history" })}>
            View all
          </Button>
        </div>
        <div className="mt-4 divide-y divide-border">
          {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
          {!isLoading && (data?.recent.length ?? 0) === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No activity yet. Start by generating an email or plan.
            </p>
          )}
          {data?.recent.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.feature} · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                </p>
              </div>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
