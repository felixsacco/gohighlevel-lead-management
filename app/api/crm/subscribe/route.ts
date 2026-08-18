import { NextRequest, NextResponse } from "next/server";
import {
  createGoHighLevelService,
  createGoHighLevelPrivateService,
} from "@/lib/gohighlevel-service";

const GOHIGHLEVEL_ACCESS_TOKEN = process.env.GOHIGHLEVEL_ACCESS_TOKEN;
const GOHIGHLEVEL_API_KEY = process.env.GOHIGHLEVEL_API_KEY; // Private Integration token
const GOHIGHLEVEL_LOCATION_ID = process.env.GOHIGHLEVEL_LOCATION_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!GOHIGHLEVEL_LOCATION_ID) {
      return NextResponse.json(
        { success: false, message: "CRM is not configured." },
        { status: 500 }
      );
    }

    const hasPrivateToken = Boolean(GOHIGHLEVEL_API_KEY);
    if (!hasPrivateToken && !GOHIGHLEVEL_ACCESS_TOKEN) {
      return NextResponse.json(
        { success: false, message: "CRM is not configured." },
        { status: 500 }
      );
    }

    const service = hasPrivateToken
      ? createGoHighLevelPrivateService(GOHIGHLEVEL_API_KEY!, GOHIGHLEVEL_LOCATION_ID)
      : createGoHighLevelService(GOHIGHLEVEL_ACCESS_TOKEN!, GOHIGHLEVEL_LOCATION_ID);

    const contact = await service.createOrUpdateContact({
      email,
      tags: ["job-alerts"],
      customFields: {
        source: "footer-signup",
      },
    });

    return NextResponse.json({
      success: true,
      contactId: contact?.id ?? null,
      message: "Subscribed to job alerts.",
    });
  } catch (error) {
    console.error("Footer signup failed:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unable to subscribe right now.",
      },
      { status: 500 }
    );
  }
}
