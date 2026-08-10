import { NextRequest, NextResponse } from 'next/server';

/**
 * Trigger Empire for MyApproved (cross-repo linking).
 * POST /api/empire-trigger — calls Khamareclarke Empire webhook with projectId myapproved.
 * Requires EMPIRE_WEBHOOK_SECRET in env (same as on Empire dashboard).
 */
const EMPIRE_URL =
  process.env.EMPIRE_WEBHOOK_URL ||
  'https://khamareclarke.com/api/empire/webhook/trigger';

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.EMPIRE_WEBHOOK_SECRET;
    if (!secret) {
      console.warn('[empire-trigger] EMPIRE_WEBHOOK_SECRET is not configured — trigger skipped.');
      return NextResponse.json({ ok: true, skipped: true, reason: 'EMPIRE_WEBHOOK_SECRET not configured' });
    }

    const body = await request.json().catch(() => ({}));
    const teamId = (body.teamId as string) || 'SALES_TEAM';
    const runPending = Boolean(body.runPending ?? true);

    const res = await fetch(EMPIRE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        projectId: 'myapproved',
        teamId,
        runPending,
        taskDescription: `MyApproved admin trigger: ${teamId}`,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: (data as { error?: string }).error || res.statusText, ok: false },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Empire trigger failed';
    return NextResponse.json({ error: message, ok: false }, { status: 500 });
  }
}
