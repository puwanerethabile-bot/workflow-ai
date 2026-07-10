import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const saveInput = z.object({
  kind: z.enum(["email", "plan", "research"]),
  title: z.string().min(1).max(200),
  content: z.any(),
  id: z.string().uuid().optional(),
});

export const saveOutput = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => saveInput.parse(data))
  .handler(async ({ data, context }) => {
    if (data.id) {
      const { data: row, error } = await context.supabase
        .from("saved_outputs")
        .update({ title: data.title, content: data.content })
        .eq("id", data.id)
        .select()
        .maybeSingle();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await context.supabase
      .from("saved_outputs")
      .insert({ user_id: context.userId, kind: data.kind, title: data.title, content: data.content })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const listSavedOutputs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_outputs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteSavedOutput = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("saved_outputs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const duplicateSavedOutput = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: original, error } = await context.supabase
      .from("saved_outputs")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !original) throw new Error(error?.message ?? "Not found");
    const { data: copy, error: copyError } = await context.supabase
      .from("saved_outputs")
      .insert({
        user_id: context.userId,
        kind: original.kind,
        title: `${original.title} (copy)`,
        content: original.content,
      })
      .select()
      .maybeSingle();
    if (copyError) throw new Error(copyError.message);
    return copy;
  });

export const listHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("history").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const dashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const { data: today } = await context.supabase
      .from("history")
      .select("feature")
      .gte("created_at", startOfDay.toISOString());
    const { data: week } = await context.supabase
      .from("history")
      .select("id")
      .gte("created_at", startOfWeek.toISOString());
    const { data: recent } = await context.supabase
      .from("history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);

    const emails = today?.filter((r: any) => r.feature === "email").length ?? 0;
    const plans = today?.filter((r: any) => r.feature === "plan").length ?? 0;
    const research = today?.filter((r: any) => r.feature === "research").length ?? 0;
    const productivityScore = Math.min(100, (week?.length ?? 0) * 8);

    return { emails, plans, research, productivityScore, recent: recent ?? [] };
  });

const settingsSchema = z.object({
  defaultEmailTone: z.enum(["formal", "friendly", "persuasive"]).default("formal"),
  defaultScheduleView: z.enum(["daily", "weekly"]).default("daily"),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  language: z.string().default("en"),
  notifications: z.boolean().default(true),
  privateHistory: z.boolean().default(false),
  aiOutputLength: z.enum(["short", "medium", "long"]).default("medium"),
});

export type UserPreferences = z.infer<typeof settingsSchema>;

export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_settings")
      .select("preferences")
      .eq("user_id", context.userId)
      .maybeSingle();
    const parsed = settingsSchema.safeParse(data?.preferences ?? {});
    return parsed.success ? parsed.data : settingsSchema.parse({});
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => settingsSchema.partial().parse(data))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("user_settings")
      .select("preferences")
      .eq("user_id", context.userId)
      .maybeSingle();
    const merged = settingsSchema.parse({ ...(existing?.preferences ?? {}), ...data });
    const { error } = await context.supabase
      .from("user_settings")
      .upsert({ user_id: context.userId, preferences: merged as any });
    if (error) throw new Error(error.message);
    return merged;
  });
