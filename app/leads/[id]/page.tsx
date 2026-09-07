import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  TRADE_SESSION_COOKIE,
  verifyTradeSessionToken,
  type TradeSessionResult,
} from "@/lib/auth/trade-session";
import { CheckCircle, Lock, MapPin, Phone, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { maskUkPhoneNumber } from "@/lib/utils/phone-mask";
import UnlockLeadButton from "./unlock-button";
import PaymentStatusPoll from "./payment-confirmation";

export const dynamic = "force-dynamic";

function formatBudget(value: any, type: any): string {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (Number.isNaN(num)) return String(value);
  const formatted = `£${num.toLocaleString("en-GB", {
    maximumFractionDigits: 2,
  })}`;
  const suffix =
    type && String(type).toLowerCase().includes("hour")
      ? "/hr"
      : type && String(type).toLowerCase().includes("day")
        ? "/day"
        : "";
  return `${formatted}${suffix}`;
}

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  // Next 13.5: params/searchParams are plain (synchronous) objects. `payment`
  // is the GHL redirect query — checkout sends the customer back to
  // `/leads/{id}?payment=success` after a hosted payment.
  searchParams?: { payment?: string };
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue-900 text-lg">Service temporarily unavailable. Please try again shortly.</p>
      </div>
    );
  }

  const { data: purchase, error } = await supabase
    .from("lead_purchases")
    .select(
      "id, job_id, tradesperson_id, lead_price_pence, status, paid_at, offered_at"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    console.error("Lead page lookup error:", error);
  }
  if (!purchase) {
    notFound();
  }

  // Buyer-binding gate: customer details belong only to the tradesperson who
  // actually unlocked/purchased this lead (lead_purchases.tradesperson_id). The
  // HttpOnly trade_session cookie is verified server-side; its `sub` must match
  // the purchase owner, otherwise we show a locked panel and never render any
  // customer name, phone, or job detail. The cookie is read at the top of the
  // component (before awaits) so the dynamic API is consumed cleanly.
  const cookieValue = cookies().get(TRADE_SESSION_COOKIE)?.value;
  // Annotated as TradeSessionResult so the no-cookie fallback's `ok: false` is
  // contextually typed as the literal (not widened to boolean), keeping the
  // `auth.ok === true` narrowing below able to reach `.claims`.
  const auth: TradeSessionResult = cookieValue
    ? verifyTradeSessionToken(cookieValue)
    : { ok: false, reason: "malformed" };
  const isOwner =
    auth.ok === true && auth.claims.sub === purchase.tradesperson_id;

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border border-blue-100 shadow-sm">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="flex justify-center mb-4">
                <Lock className="w-10 h-10 text-blue-900/40" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-brand-navy mb-3">
                This lead is locked
              </h1>
              <p className="text-sm text-blue-900/80 mb-6">
                This lead is tied to the tradesperson account that unlocked it.
                Sign in to that account to view customer details.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button asChild className="bg-brand-navy hover:bg-brand-navy">
                  <Link href="/login/trade">Sign in to your account</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/tradesperson">Back to dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { data: job } = await supabase
    .from("jobs")
    .select(
      "id, trade, postcode, job_description, budget, budget_type, client_id, created_at"
    )
    .eq("id", purchase.job_id)
    .maybeSingle();

  const { data: client } = job?.client_id
    ? await supabase
        .from("clients")
        .select("first_name, last_name, phone, city, postcode")
        .eq("id", job.client_id)
        .maybeSingle()
    : { data: null };

  const isPaid = purchase.status === "paid";
  const leadCost = `£${((purchase.lead_price_pence || 499) / 100).toFixed(2)}`;
  const fullPhone = String((client as any)?.phone || "").trim();
  const maskedPhone = maskUkPhoneNumber(fullPhone);
  const customerName = [
    (client as any)?.first_name,
    (client as any)?.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  const budgetLabel = formatBudget(job?.budget, job?.budget_type);
  const trade = job?.trade || "tradesperson";
  const area =
    job?.postcode ||
    (client as any)?.postcode ||
    (client as any)?.city ||
    "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/tradesperson"
            className="text-sm text-blue-700 hover:underline"
          >
            ← Back to dashboard
          </Link>
        </div>

        <Card className="border border-blue-100 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-green-700">
                Verified MyApproved lead
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-2">
              New {trade} lead{area ? ` in ${area}` : ""}
            </h1>
            <p className="text-sm text-blue-700/80 mb-6">
              You were matched to this job because of your trade and service
              area. Pay once to unlock the customer's number and apply for the
              work.
            </p>

            <div className="space-y-4 text-sm text-blue-900">
              {job?.job_description && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-blue-900/70 mb-1">
                    Job description
                  </div>
                  <p className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    {job.job_description}
                  </p>
                </div>
              )}

              {budgetLabel && (
                <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <span className="text-yellow-700 font-bold text-lg">
                    {budgetLabel}
                  </span>
                  <span className="text-xs text-yellow-900/70">
                    Customer's stated budget / quote target
                  </span>
                </div>
              )}

              {area && (
                <div className="flex items-center gap-2 text-blue-900/90">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>{area}</span>
                </div>
              )}

              <div className="flex items-center gap-3 bg-white border border-blue-100 rounded-xl p-4">
                <Phone className="w-5 h-5 text-blue-700 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-wide text-blue-900/70">
                    Customer
                  </div>
                  {customerName && (
                    <div className="font-semibold text-blue-900">
                      {customerName}
                    </div>
                  )}
                  <div className="font-mono text-base">
                    {isPaid && fullPhone ? (
                      <a
                        href={`tel:${fullPhone}`}
                        className="text-green-700 hover:underline"
                      >
                        {fullPhone}
                      </a>
                    ) : (
                      <span className="text-blue-900/80">
                        {maskedPhone || "Hidden until unlocked"}
                      </span>
                    )}
                  </div>
                </div>
                {!isPaid && (
                  <Lock className="w-5 h-5 text-blue-900/40 flex-shrink-0" />
                )}
                {isPaid && (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
              </div>
            </div>

            {!isPaid && (
              <div className="mt-8 border-t border-blue-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-blue-900/70">
                      Lead cost
                    </div>
                    <div className="text-2xl font-extrabold text-blue-900">
                      {leadCost}
                    </div>
                  </div>
                  <div className="text-xs text-blue-900/70 max-w-[200px] text-right">
                    One-off payment. Charged via Stripe.
                  </div>
                </div>

                {searchParams?.payment === "success" ? (
                  // GHL just bounced the customer back here after the hosted
                  // payment. The webhook may not have landed yet — poll the
                  // owner-scoped status endpoint until the purchase flips to
                  // paid, then re-render into the unlocked state below. Without
                  // this the button would still say "Unlock" and re-pay an
                  // in-flight purchase.
                  <PaymentStatusPoll leadId={purchase.id} />
                ) : (
                  <>
                    <UnlockLeadButton
                      leadId={purchase.id}
                      leadCost={leadCost}
                    />

                    <p className="text-xs text-blue-900/60 mt-3 text-center">
                      Prefer unlimited leads? Switch to the £1,000 / month
                      Unlimited plan from your dashboard.
                    </p>
                  </>
                )}
              </div>
            )}

            {isPaid && (
              <div className="mt-8 border-t border-blue-100 pt-6">
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  Lead unlocked. Get in touch with the customer above.
                </div>
                <p className="text-xs text-blue-900/60 mt-2">
                  We recommend calling within 30 minutes - most homeowners hire
                  the first tradesperson who responds.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button asChild className="bg-brand-navy hover:bg-brand-navy">
                    <Link href={`/post-job`}>Submit your quote</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/dashboard/tradesperson">Back to dashboard</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
