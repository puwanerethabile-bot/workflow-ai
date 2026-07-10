import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

export function AppShell({
  children,
  userEmail,
  displayName,
}: {
  children: ReactNode;
  userEmail: string;
  displayName: string;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur">
            <SidebarTrigger className="md:hidden" />
            <Link to="/dashboard" className="flex items-center gap-2 font-semibold md:hidden">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-primary text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              Workplace AI
            </Link>
            <div className="ml-auto">
              <AppTopbar userEmail={userEmail} displayName={displayName} />
            </div>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
            <p className="mx-auto max-w-4xl">
              <span className="font-medium text-foreground">Responsible AI:</span> AI-generated content may contain
              inaccuracies. Always review and verify important information before sending emails, making business
              decisions, or sharing outputs.
            </p>
            <p className="mt-2">
              © {new Date().getFullYear()} Workplace AI · v1.0 ·{" "}
              <Link to="/help" className="hover:text-foreground">Help</Link>
            </p>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
