import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "openai/gpt-5.5";

function getGateway(structured = false) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key, { structuredOutputs: structured });
}

async function recordHistory(
  supabase: any,
  userId: string,
  feature: "email" | "plan" | "research",
  title: string,
  preview: string,
  payload: unknown,
) {
  await supabase.from("history").insert({
    user_id: userId,
    feature,
    title,
    preview: preview.slice(0, 240),
    status: "completed",
    payload: payload as any,
  });
}

// ---------- Email ----------
const emailInput = z.object({
  recipient: z.string().min(1).max(200),
  purpose: z.string().min(1).max(500),
  keyPoints: z.string().max(2000).optional().default(""),
  additionalNotes: z.string().max(1000).optional().default(""),
  length: z.enum(["short", "medium", "long"]).default("medium"),
  tone: z.enum(["formal", "friendly", "persuasive"]).default("formal"),
  companyName: z.string().max(200).optional().default(""),
  deadline: z.string().max(200).optional().default(""),
  callToAction: z.string().max(500).optional().default(""),
});

export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => emailInput.parse(data))
  .handler(async ({ data, context }) => {
    const gateway = getGateway(false);
    const prompt = `You are a professional workplace communication assistant.

Generate a ${data.length} ${data.tone} workplace email.

Recipient: ${data.recipient}
Purpose: ${data.purpose}
${data.companyName ? `Company: ${data.companyName}\n` : ""}${data.keyPoints ? `Key points to cover:\n${data.keyPoints}\n` : ""}${data.additionalNotes ? `Additional notes: ${data.additionalNotes}\n` : ""}${data.deadline ? `Deadline: ${data.deadline}\n` : ""}${data.callToAction ? `Call-to-action: ${data.callToAction}\n` : ""}
Requirements:
- Include a clear subject line as the first line: "Subject: ..."
- Grammatically correct, concise, easy to understand
- Professional tone matching "${data.tone}"
- Appropriate length for "${data.length}"

Return only the email (subject line + body). No explanations.`;

    const { text } = await generateText({ model: gateway(MODEL), prompt });
    await recordHistory(context.supabase, context.userId, "email", `Email to ${data.recipient}`, text, { input: data });
    return { text };
  });

// ---------- Planner ----------
const planInput = z.object({
  period: z.enum(["daily", "weekly"]).default("daily"),
  tasks: z.string().min(1).max(4000),
  workingHours: z.string().max(200).optional().default("9:00-17:00"),
  breakPreferences: z.string().max(500).optional().default(""),
  meetings: z.string().max(1000).optional().default(""),
  focusAreas: z.string().max(500).optional().default(""),
});

const planSchema = z.object({
  summary: z.string(),
  prioritized: z.array(
    z.object({
      title: z.string(),
      priority: z.enum(["high", "medium", "low"]),
      estimatedMinutes: z.number(),
      rationale: z.string(),
    }),
  ),
  schedule: z.array(
    z.object({
      time: z.string(),
      activity: z.string(),
      type: z.enum(["task", "meeting", "break", "focus"]),
    }),
  ),
  tips: z.array(z.string()),
});

export const generatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => planInput.parse(data))
  .handler(async ({ data, context }) => {
    const gateway = getGateway(true);
    const prompt = `You are an expert productivity coach creating a ${data.period} work plan.

Working hours: ${data.workingHours}
Break preferences: ${data.breakPreferences || "standard breaks"}
Meetings: ${data.meetings || "none specified"}
Focus areas: ${data.focusAreas || "general"}

Tasks:
${data.tasks}

Produce an optimized schedule that:
- Prioritizes urgent + important tasks first
- Groups similar tasks
- Uses realistic time blocks
- Includes breaks
- Balances workload
- Provides 3-5 actionable productivity tips
Return at most 10 prioritized tasks and 15 schedule entries.`;

    try {
      const { output } = await generateText({
        model: gateway(MODEL),
        output: Output.object({ schema: planSchema }),
        prompt,
      });
      await recordHistory(context.supabase, context.userId, "plan", `${data.period === "daily" ? "Daily" : "Weekly"} plan`, output.summary, { input: data, output });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("The AI response could not be parsed. Please try again.");
      }
      throw error;
    }
  });

// ---------- Research ----------
const researchInput = z.object({
  topic: z.string().max(500).optional().default(""),
  content: z.string().min(20).max(20000),
  length: z.enum(["brief", "detailed", "executive"]).default("brief"),
});

const researchSchema = z.object({
  executiveSummary: z.string(),
  keyPoints: z.array(z.string()),
  statistics: z.array(z.string()),
  insights: z.array(z.string()),
  recommendations: z.array(z.string()),
  actionItems: z.array(z.string()),
});

export const generateResearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => researchInput.parse(data))
  .handler(async ({ data, context }) => {
    const gateway = getGateway(true);
    const lengthGuidance = {
      brief: "Keep the executive summary to 2-3 sentences, 3-5 items per list.",
      detailed: "Provide a thorough executive summary (1 paragraph), 5-8 items per list.",
      executive: "Focus on business impact and decisions. Executive summary of 3-4 sentences.",
    }[data.length];

    const prompt = `You are a senior research analyst summarizing content for a busy professional.

Topic: ${data.topic || "(inferred from content)"}
Style: ${data.length}. ${lengthGuidance}

Content to summarize:
"""
${data.content}
"""

Extract main ideas, key findings, important statistics, insights, recommendations, and action items. Be precise and factual. If a section has no relevant items, return an empty array for it.`;

    try {
      const { output } = await generateText({
        model: gateway(MODEL),
        output: Output.object({ schema: researchSchema }),
        prompt,
      });
      const title = data.topic || output.executiveSummary.slice(0, 60);
      await recordHistory(context.supabase, context.userId, "research", title, output.executiveSummary, { input: data, output });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("The AI response could not be parsed. Please try again.");
      }
      throw error;
    }
  });
