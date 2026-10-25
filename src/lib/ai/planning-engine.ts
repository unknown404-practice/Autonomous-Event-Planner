// EventPilot AI - GenAI Planning Orchestration Service
// Powered by Local Ollama Gemma 2B (Primary AI Engine)
// and High-Fidelity Deterministic Fallback Planner (Secondary Baseline).
// Adheres strictly to Directive 6 (Strict AI Reliability) & Directive 7 (Financial Correctness).
// Bounded execution: Never hangs, 60s timeout with instant graceful degradation.

import { GeneratedPlanOutput, PlanGenerationInput } from "../types";
import { generateHeuristicPlan } from "./heuristic-planner";
import {
  ConceptSchema,
  GeneratedPlanSchema,
  GeneratedPlanSchemaType,
} from "./schemas";

function cleanAndExtractJson(raw: string): any {
  // Strip markdown fences
  const clean = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(clean);
  } catch {
    // If there is preamble or postamble, extract the outer-most balanced curly braces
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = clean.slice(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }
    throw new Error("No parseable JSON object found in LLM output");
  }
}

function buildGemmaPrompt(input: PlanGenerationInput): string {
  return `You are EventPilot AI, an elite event planner. Return ONLY valid JSON adhering strictly to this schema:
{
  "concept": {
    "title": "Creative Event Title",
    "tagline": "Compelling one-sentence tagline",
    "themeDescription": "Detailed sensory description of the event theme, decor, and guest experience (at least 15 words).",
    "colorPalette": [
      {"name": "Color Name", "hex": "#RRGGBB", "role": "Primary Base"},
      {"name": "Accent Name", "hex": "#RRGGBB", "role": "Warm Accent"},
      {"name": "Highlight Name", "hex": "#RRGGBB", "role": "Highlight"}
    ],
    "stylingIdeas": [
      "Specific decor or staging concept 1",
      "Specific floral or lighting concept 2",
      "Specific guest arrival or sensory concept 3"
    ],
    "atmosphereAndVibe": "Atmospheric tone and emotional energy of the event."
  },
  "contingencies": [
    {
      "riskScenario": "Specific risk scenario for this event type/location",
      "severity": "HIGH",
      "mitigationStrategy": "Actionable mitigation strategy"
    },
    {
      "riskScenario": "Secondary risk scenario",
      "severity": "MEDIUM",
      "mitigationStrategy": "Actionable mitigation strategy"
    }
  ]
}

Event details:
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

DO NOT include markdown fences or preamble. Return ONLY pure valid JSON.`;
}

function normalizeConcept(raw: any) {
  if (!raw || typeof raw !== "object") return null;
  const concept = { ...raw };

  // Normalize stylingIdeas if array of objects or single string
  if (Array.isArray(concept.stylingIdeas)) {
    concept.stylingIdeas = concept.stylingIdeas.map((s: any) =>
      typeof s === "string" ? s : s.name || s.idea || s.description || JSON.stringify(s)
    );
  } else if (typeof concept.stylingIdeas === "string") {
    concept.stylingIdeas = [concept.stylingIdeas, "Curated ambient floral and lighting accents"];
  }

  // Normalize colorPalette hex codes
  if (Array.isArray(concept.colorPalette)) {
    const validHex = /^#([0-9a-fA-F]{3}){1,2}$/;
    concept.colorPalette = concept.colorPalette.map((c: any, idx: number) => {
      let hex = typeof c.hex === "string" ? c.hex.trim() : "";
      if (!validHex.test(hex)) {
        const fallbacks = ["#1e3a8a", "#d97706", "#f8fafc", "#059669"];
        hex = fallbacks[idx % fallbacks.length];
      }
      return {
        name: c.name || `Accent ${idx + 1}`,
        hex,
        role: c.role || (idx === 0 ? "Primary Base" : "Accent"),
      };
    });
  }

  // Ensure minimum array lengths for Zod validation
  if (!Array.isArray(concept.stylingIdeas) || concept.stylingIdeas.length < 2) {
    concept.stylingIdeas = [
      concept.stylingIdeas?.[0] || "Curated ambient floral arrangements",
      "Architectural and warm candlelight illumination",
    ];
  }

  if (!Array.isArray(concept.colorPalette) || concept.colorPalette.length < 2) {
    concept.colorPalette = [
      { name: "Signature Navy", hex: "#1e3a8a", role: "Primary Base" },
      { name: "Luminous Gold", hex: "#d97706", role: "Warm Accent" },
    ];
  }

  if (!concept.themeDescription || concept.themeDescription.length < 10) {
    concept.themeDescription = `${concept.title || "Curated celebration"} thoughtfully designed for an unforgettable guest experience.`;
  }

  if (!concept.atmosphereAndVibe || concept.atmosphereAndVibe.length < 5) {
    concept.atmosphereAndVibe = "Warm, elegant, and seamlessly coordinated.";
  }

  return concept;
}

function normalizeContingencies(raw: any) {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const validSeverities = new Set(["LOW", "MEDIUM", "HIGH"]);

  const normalized = raw.map((item: any, idx: number) => {
    let severity = typeof item.severity === "string" ? item.severity.toUpperCase() : "MEDIUM";
    if (!validSeverities.has(severity)) severity = "MEDIUM";
    return {
      riskScenario: item.riskScenario || `Operational contingency scenario ${idx + 1}`,
      severity,
      mitigationStrategy:
        item.mitigationStrategy || "Active coordinator monitoring with pre-arranged vendor backup.",
    };
  });

  return normalized.length >= 2 ? normalized : null;
}

async function callOllama(
  prompt: string,
  modelName: string = "gemma:2b"
): Promise<any | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for local CPU inference

  try {
    const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        prompt,
        format: "json",
        stream: false,
        options: {
          temperature: 0.2,
          num_thread: 8,
          num_predict: 500,
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`Ollama responded with status ${res.status}`);
      return null;
    }

    const data = await res.json();
    const content = data.response?.trim() || "";
    return cleanAndExtractJson(content);
  } catch (err: any) {
    console.warn("Ollama call failed or timed out:", err?.message || err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateEventPlan(
  input: PlanGenerationInput
): Promise<GeneratedPlanOutput> {
  // Compute deterministic baseline (Directive 7: Decimal-safe financial and timeline correctness)
  const baseline = generateHeuristicPlan(input);

  // 1. Primary AI Planning Engine: Local Ollama Gemma 2B
  try {
    const localModel = process.env.OLLAMA_MODEL || "gemma:2b";
    const prompt = buildGemmaPrompt(input);
    const rawOutput = await callOllama(prompt, localModel);

    if (rawOutput) {
      // Check if full GeneratedPlanSchema was returned directly
      const fullValidated = GeneratedPlanSchema.safeParse(rawOutput);
      if (fullValidated.success) {
        return {
          ...fullValidated.data,
          provenance: "AI_GENERATED",
          generatedAt: new Date().toISOString(),
        };
      }

      // Extract and normalize concept
      const rawConcept = rawOutput.concept || rawOutput;
      const normalizedConcept = normalizeConcept(rawConcept);
      const validatedConcept = ConceptSchema.safeParse(normalizedConcept);

      if (validatedConcept.success) {
        const rawContingencies = rawOutput.contingencies || [];
        const normalizedContingencies = normalizeContingencies(rawContingencies);

        return {
          concept: validatedConcept.data,
          recommendedBudgetItems: baseline.recommendedBudgetItems,
          recommendedSchedule: baseline.recommendedSchedule,
          vendorRequirements: baseline.vendorRequirements,
          contingencies: normalizedContingencies || baseline.contingencies,
          provenance: "AI_GENERATED",
          generatedAt: new Date().toISOString(),
        };
      } else {
        console.warn("Concept validation failed:", validatedConcept.error.format());
      }
    }
  } catch (ollamaErr) {
    console.warn("Ollama Gemma 2B generation error, falling back to heuristic engine:", ollamaErr);
  }

  // 2. Guaranteed Deterministic Fallback Planner (Directive 6: Provenance & Reliability)
  return baseline;
}
