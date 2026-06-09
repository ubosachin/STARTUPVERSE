import { NextResponse } from "next/server";
import OpenAI from "openai";
import { env } from "@/lib/utils/env";

export async function POST(request: Request) {
  const { description } = (await request.json().catch(() => ({}))) as { description?: string };

  if (!description) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  if (!env.openaiApiKey) {
    return NextResponse.json({
      demo: true,
      healthScore: 88,
      recommendations: ["Clarify the wedge", "Add buyer proof", "Quantify retention", "Tighten fundraising ask"]
    });
  }

  const openai = new OpenAI({ apiKey: env.openaiApiKey });
  const response = await openai.responses.create({
    model: env.openaiModel,
    instructions: "You are StartupVerse's startup analyst. Return concise founder-grade advice.",
    input: `Analyze this startup and return concise recommendations with a health score: ${description}`
  });

  return NextResponse.json({ analysis: response.output_text });
}
