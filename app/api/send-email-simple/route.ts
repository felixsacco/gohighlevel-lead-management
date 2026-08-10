import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  void request;
  return NextResponse.json(
    {
      error:
        "Deprecated endpoint. Use /api/send-verification-email or /api/notifications/trigger instead.",
    },
    { status: 410 },
  );
} 