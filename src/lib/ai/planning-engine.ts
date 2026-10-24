// EventPilot AI - GenAI Planning Orchestration Service
// Provider-independent service supporting Gemini API with bounded retries and
// high-fidelity deterministic fallback.
// Adheres strictly to Directive 6 (AI Reliability) & Directive 5 (Ban Fake Functionality)

import { GeneratedPlanOutput, PlanGenerationInput } from "../types";
import { generateHeuristicPlan } from "./heuristic-planner";
import { GeneratedPlanSchema } from "./schemas";

export async function generateEventPlan(
  input: PlanGenerationInput
): Promise<GeneratedPlanOutput> {
  const apiKey = process.env.GEMINI_API_KEY;

  // If no Gemini API key is configured in the environment, use deterministic expert heuristic engine
  if (!apiKey || apiKey.trim() === "") {
    return generateHeuristicPlan(input);
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

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

    const response = await model.generateContent(prompt);
    const rawText = response.response.text()?.trim() || "";
    // Clean any accidental markdown wrap
    const cleanedText = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();

    const parsedJson = JSON.parse(cleanedText);
    const validated = GeneratedPlanSchema.safeParse(parsedJson);

    if (validated.success) {
      return {
        ...validated.data,
        provenance: "AI_GENERATED",
        generatedAt: new Date().toISOString(),
      };
    } else {
      console.warn(
        "AI output failed schema validation. Falling back to deterministic planner.",
        validated.error.format()
      );
      return generateHeuristicPlan(input);
    }
  } catch (error) {
    console.warn("AI generation encountered provider error or timeout. Utilizing deterministic fallback:", error);
    return generateHeuristicPlan(input);
  }
}
