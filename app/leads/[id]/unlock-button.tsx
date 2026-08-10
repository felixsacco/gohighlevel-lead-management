"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";

interface UnlockLeadButtonProps {
  leadId: string;
  leadCost: string;
}

export default function UnlockLeadButton({
  leadId,
  leadCost,
}: UnlockLeadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      // GHL handles payment for lead unlocks. If GHL credentials are not
      // configured, the API degrades gracefully and returns an error.
      const res = await fetch(`/api/leads/${leadId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Could not start checkout.");
      }
      window.location.href = data.url as string;
    } catch (err: any) {
      setError(err?.message || "Could not start checkout.");
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        onClick={handleClick}
        disabled={loading}
        size="lg"
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold text-base"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting to secure checkout...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Unlock this lead for {leadCost}
          </>
        )}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
