"use client";

// PaymentStatusPoll — rendered on /leads/[id]?payment=success while the GHL
// webhook for the just-completed payment has not yet landed. It polls the
// owner-scoped GET /api/leads/[id]/status endpoint and, the moment the
// purchase flips to paid, asks the router to re-render the server page — which
// then shows the unlocked phone number instead of a stale offered-state button.
// Times out to a manual-refresh prompt so the user is never left on an infinite
// spinner if the webhook is delayed.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";

type PollState =
  | { status: "checking" }
  | { status: "paid" }
  | { status: "timed_out" };

const POLL_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 30; // ~45s of polling before falling back to manual refresh

export default function PaymentStatusPoll({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [state, setState] = useState<PollState>({ status: "checking" });
  const attempts = useRef(0);

  const refreshNow = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    let stopped = false;

    async function poll() {
      // Mirrors unlock-button.tsx: the client-authenticated actor sends the
      // localStorage tradeToken as a Bearer header. The route also accepts the
      // HttpOnly trade_session cookie, so either credential works.
      const token = localStorage.getItem("tradeToken") ?? "";
      try {
        const res = await fetch(`/api/leads/${leadId}/status`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.isPaid === true) {
            if (!stopped) {
              setState({ status: "paid" });
              // Re-render server-side; the page now shows the unlocked state.
              router.refresh();
            }
            return;
          }
        }
        // Not ok or not paid yet: fall through and keep polling.
      } catch {
        // Transient network failure — keep polling.
      }

      attempts.current += 1;
      if (stopped) return;
      if (attempts.current >= MAX_ATTEMPTS) {
        setState({ status: "timed_out" });
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();
    return () => {
      stopped = true;
    };
  }, [leadId, router]);

  if (state.status === "paid") {
    return (
      <div className="flex items-center justify-center gap-2 text-green-700 font-semibold rounded-xl bg-green-50 border border-green-200 p-4">
        <CheckCircle2 className="w-5 h-5" />
        Payment confirmed — unlocking your lead…
      </div>
    );
  }

  if (state.status === "timed_out") {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
        <p className="text-sm text-amber-800">
          We&apos;re still confirming your payment. If you were charged, your
          lead is already unlocked — refresh to see it. Need help? Email{" "}
          <a href="mailto:support@myapproved.com" className="underline">
            support@myapproved.com
          </a>
          .
        </p>
        <button
          onClick={refreshNow}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-amber-900 hover:underline"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh now
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 text-blue-900 rounded-xl bg-blue-50 border border-blue-100 p-4">
      <Loader2 className="w-5 h-5 animate-spin text-blue-700" />
      <span className="text-sm">
        Payment received — confirming your unlock…
      </span>
    </div>
  );
}
