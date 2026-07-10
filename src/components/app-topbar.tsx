import { useEffect, useState } from "react";
import { Bell, Moon, Sun, LogOut, User as UserIcon, Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

export function AppTopbar({ userEmail, displayName }: { userEmail: string; displayName: string }) {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  const initials = (displayName || userEmail || "?")
    .split(/\s+|@/)[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <div className="relative hidden sm:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search saved & history…" className="h-9 w-56 pl-8 md:w-72" />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <p className="text-sm font-medium">Notifications</p>
          <p className="mt-1 text-xs text-muted-foreground">You're all caught up.</p>
        </PopoverContent>
      </Popover>

      <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 gap-2 px-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-gradient-primary text-xs text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[120px] truncate text-sm sm:inline">{displayName || userEmail}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate">{userEmail}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
            <UserIcon className="mr-2 h-4 w-4" /> Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
