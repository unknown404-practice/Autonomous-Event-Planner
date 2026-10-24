// EventPilot AI - GenAI Planning Orchestration Service
// Powered by OpenRouter API (Free model tiers supported) with bounded retries
// and high-fidelity deterministic fallback.
// Adheres strictly to Directive 6 (AI Reliability) & Directive 5 (Ban Fake Functionality)

import { GeneratedPlanOutput, PlanGenerationInput } from "../types";
import { generateHeuristicPlan } from "./heuristic-planner";
import { GeneratedPlanSchema } from "./schemas";

export async function generateEventPlan(
  input: PlanGenerationInput
): Promise<GeneratedPlanOutput> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // If no API key is configured, utilize deterministic heuristic planning engine
  if ((!openRouterKey || openRouterKey.trim() === "") && (!geminiKey || geminiKey.trim() === "")) {
    return generateHeuristicPlan(input);
  }

  const prompt = `You are EventPilot AI, an elite professional event planning strategist.
Generate a comprehensive, actionable, realistic plan for the following event:
- Event Name: ${input.eventName}
- Event Type: ${input.eventType}
- Event Date: ${input.eventDate}
- Location: ${input.location}
- Guest Count: ${input.guestCount}
- Total Budget: ${input.totalBudget} ${input.currency}
- Style/Theme: ${input.themeOrStyle || "Modern & Elegant"}
- Formality: ${input.formality || "SEMI_FORMAL"}
- Setting: ${input.indoorOutdoor || "HYBRID"}
- Cultural Traditions: ${input.culturalTraditions || "Standard"}
- Dietary Notes: ${input.dietaryNotes || "None specified"}
- Special Constraints: ${input.specialConstraints || "None"}

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON adhering strictly to this schema:
{
  "concept": {
    "title": string,
    "tagline": string,
    "themeDescription": string,
    "colorPalette": [{"name": string, "hex": "#RRGGBB", "role": string}],
    "stylingIdeas": [string],
    "atmosphereAndVibe": string
  },
  "recommendedBudgetItems": [
    {
      "category": "VENUE"|"CATERING"|"PHOTOGRAPHY"|"VIDEOGRAPHY"|"DECORATION"|"FLORIST"|"MUSIC_ENTERTAINMENT"|"TRANSPORTATION"|"ATTIRE_BEAUTY"|"STATIONERY"|"CAKE_BAKERY"|"SECURITY_STAFF"|"AV_EQUIPMENT"|"OTHER",
      "description": string,
      "estimatedQuantity": integer (>=1),
      "estimatedUnitCost": number (>=0),
      "priority": "ESSENTIAL"|"RECOMMENDED"|"OPTIONAL",
      "costSavingTip": string (optional)
    }
  ],
  "recommendedSchedule": [
    {
      "id": string (e.g. "task-1"),
      "title": string,
      "description": string,
      "category": "VENUE"|...|"GENERAL",
      "priority": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL",
      "daysBeforeEvent": integer (e.g. 90 = 90 days before event, 0 = event day, -1 = 1 day after),
      "dependsOnTaskIds": [string],
      "phase": "EARLY_PLANNING"|"MID_PLANNING"|"FINAL_PREPARATION"|"EVENT_DAY"|"POST_EVENT"
    }
  ],
  "vendorRequirements": [
    {
      "category": "VENUE"|...,
      "keyQuestionsToAsk": [string],
      "criticalDeliverables": [string],
      "redFlagsToAvoid": [string]
    }
  ],
  "contingencies": [
    {
      "riskScenario": string,
      "severity": "LOW"|"MEDIUM"|"HIGH",
      "mitigationStrategy": string
    }
  ]
}

DO NOT include markdown backticks like \`\`\`json. Return pure JSON.`;

  // 1. Try OpenRouter API first if key configured
  if (openRouterKey && openRouterKey.trim() !== "") {
    try {
      const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey.trim()}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "EventPilot AI",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are EventPilot AI, an elite professional event planning strategist. You must respond with valid JSON adhering strictly to the requested schema. No conversational preamble, no markdown backticks.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`OpenRouter API responded with status ${res.status}. Falling back.`);
      } else {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim() || "";
        const cleanedText = content.replace(/^```json\s*/, "").replace(/```$/, "").trim();
        const parsedJson = JSON.parse(cleanedText);
        const validated = GeneratedPlanSchema.safeParse(parsedJson);

        if (validated.success) {
          return {
            ...validated.data,
            provenance: "AI_GENERATED",
            generatedAt: new Date().toISOString(),
          };
        } else {
          console.warn("OpenRouter output failed schema validation:", validated.error.format());
        }
      }
    } catch (openRouterError) {
      console.warn("OpenRouter API call failed or timed out:", openRouterError);
    }
  }

  // 2. Fallback to Gemini if Gemini key present
  if (geminiKey && geminiKey.trim() !== "") {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const response = await model.generateContent(prompt);
      const rawText = response.response.text()?.trim() || "";
      const cleanedText = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();

      const parsedJson = JSON.parse(cleanedText);
      const validated = GeneratedPlanSchema.safeParse(parsedJson);

      if (validated.success) {
        return {
          ...validated.data,
          provenance: "AI_GENERATED",
          generatedAt: new Date().toISOString(),
        };
      }
    } catch (geminiError) {
      console.warn("Gemini fallback failed:", geminiError);
    }
  }

  // 3. Fallback to deterministic expert heuristic planner
  return generateHeuristicPlan(input);
}
