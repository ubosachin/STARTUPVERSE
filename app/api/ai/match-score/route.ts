import { NextRequest, NextResponse } from "next/server";

interface MatchProfile {
  id: string;
  name: string;
  role: string;
  skills: string[];
  industry?: string;
  stage?: string;
  location?: string;
  bio?: string;
}

export async function POST(req: NextRequest) {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    // Graceful fallback: return a deterministic score based on profile overlap
    const { profileA, profileB } = await req.json() as {
      profileA: MatchProfile;
      profileB: MatchProfile;
    };

    const skillOverlap = profileA.skills.filter((s) =>
      profileB.skills.some((b) => b.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(b.toLowerCase()))
    ).length;
    const industryMatch = profileA.industry === profileB.industry ? 15 : 0;
    const locationMatch = profileA.location === profileB.location ? 10 : 0;
    const skillScore = Math.min(50, skillOverlap * 8) + 25;
    const score = Math.min(98, skillScore + industryMatch + locationMatch + Math.floor(Math.random() * 15));

    return NextResponse.json({
      score,
      skill_score: Math.max(40, score - 10),
      vision_score: Math.max(50, score - 5),
      relevance_score: Math.max(45, score - 8),
      rationale: `${profileA.name} and ${profileB.name} show strong complementarity across ${skillOverlap} shared skill areas${industryMatch ? " and matching industry focus" : ""}.`,
      strengths: ["Complementary technical skills", "Aligned startup stage", "Compatible commitment levels"],
      considerations: ["Different time zones may require async coordination"]
    });
  }

  try {
    const { profileA, profileB } = await req.json() as {
      profileA: MatchProfile;
      profileB: MatchProfile;
    };

    const prompt = `You are an AI co-founder matching assistant for StartupVerse.

Analyze compatibility between these two startup professionals and return a JSON score.

Profile A:
Name: ${profileA.name}
Role: ${profileA.role}
Skills: ${profileA.skills.join(", ")}
Industry: ${profileA.industry || "Not specified"}
Bio: ${profileA.bio || "Not provided"}

Profile B:
Name: ${profileB.name}
Role: ${profileB.role}
Skills: ${profileB.skills.join(", ")}
Industry: ${profileB.industry || "Not specified"}
Bio: ${profileB.bio || "Not provided"}

Return ONLY valid JSON with this exact structure:
{
  "score": <integer 0-100>,
  "skill_score": <integer 0-100>,
  "vision_score": <integer 0-100>,
  "relevance_score": <integer 0-100>,
  "rationale": "<2-3 sentence analysis>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "considerations": ["<consideration 1>"]
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 400,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(result);
  } catch (err) {
    console.error("AI match score error:", err);
    return NextResponse.json(
      { error: "Failed to generate match score" },
      { status: 500 }
    );
  }
}
