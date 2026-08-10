import { NextResponse } from "next/server";
import {
  LIVE_PRICING_DISCLAIMER,
  calculateLivePrice,
} from "@/lib/pricing/PricingCalculator";
import { deepseekService } from "@/lib/deepseek-service";

export async function POST(request: Request) {
  try {
    const { description, trade, postcode, urgency } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 },
      );
    }

    // Always compute locally from the pricing matrix
    let accessDifficulty: "easy" | "moderate" | "hard" | undefined;

    // Try AI classification for richer input (complexity, access, hours, materials)
    const classification = await deepseekService.generateClassification({
      trade: trade || "other",
      description,
      postcode,
      urgency,
    });

    if (classification) {
      accessDifficulty = classification.accessDifficulty;
    }

    const result = calculateLivePrice({
      description,
      trade,
      postcode,
      urgency,
      accessDifficulty,
    });

    return NextResponse.json({
      estimate: result.estimateLabel,
      exactPrice: result.exactPrice,
      min: result.min,
      max: result.max,
      indicative: false,
      source: "local",
      disclaimer: LIVE_PRICING_DISCLAIMER,
      breakdown: {
        basePrice: result.basePrice,
        region: result.region,
        complexity: result.complexity,
        trade: result.trade,
        urgency: result.urgency,
        accessDifficulty: accessDifficulty || "moderate",
      },
      classification: classification
        ? {
            jobType: classification.jobType,
            complexity: classification.complexity,
            accessDifficulty: classification.accessDifficulty,
            estimatedHours: classification.estimatedHours,
            materialsRequired: classification.materialsRequired,
          }
        : null,
    });
  } catch (error) {
    console.error("Error getting estimate:", error);
    return NextResponse.json(
      { error: "Failed to get estimate" },
      { status: 500 },
    );
  }
}
