"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
type User = {
  id: string;
  email?: string;
  firstName?: string;
  type: string;
};

type JobOpt = { id: string; trade: string; postcode: string; application_status?: string };

const CATEGORIES = [
  { value: "payment", label: "Payment or invoice" },
  { value: "quality", label: "Quality of work" },
  { value: "communication", label: "Communication / no-show" },
  { value: "safety", label: "Safety concern" },
  { value: "other", label: "Other" },
];

export default function ReportIssuePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState(1);
  const [jobs, setJobs] = useState<JobOpt[]>([]);
  const [jobId, setJobId] = useState<string>("");
  const [category, setCategory] = useState("other");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [doneId, setDoneId] = useState<string | null>(null);
  const [slaBy, setSlaBy] = useState<string | null>(null);

  const slaHours = Number(process.env.NEXT_PUBLIC_DISPUTE_SLA_ACK_HOURS || 24);

  const loadJobs = useCallback(async (u: User) => {
    try {
      if (u.type === "client") {
        const res = await fetch(
          `/api/client/jobs?userId=${encodeURIComponent(u.id)}`,
          { cache: "no-store" },
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data.jobs)) {
          setJobs(
            data.jobs.map((j: { id: string; trade: string; postcode: string; application_status?: string }) => ({
              id: j.id,
              trade: j.trade,
              postcode: j.postcode,
              application_status: j.application_status,
            })),
          );
        }
      } else {
        const res = await fetch(
          `/api/tradesperson/job-options-for-report?userId=${encodeURIComponent(u.id)}`,
          { cache: "no-store" },
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data.jobs)) setJobs(data.jobs);
      }
    } catch {
      setJobs([]);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const u = JSON.parse(raw) as User;
      if (u.type !== "client" && u.type !== "tradesperson") {
        router.replace("/");
        return;
      }
      setUser(u);
      setEmail(u.email || "");
      void loadJobs(u);
    } catch {
      router.replace("/");
    }
  }, [router, loadJobs]);

  const submit = async () => {
    if (!user) return;
    setErr("");
    if (!details.trim() || details.trim().length < 20) {
      setErr("Please describe what happened in at least 20 characters.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/disputes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userType: user.type,
          disputeDetails: details.trim(),
          userEmail: email.trim(),
          userPhone: phone.trim(),
          fullMessage: `${email} | ${phone} | [${category}] ${details}`,
          jobId: jobId || null,
          disputeCategory: category,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Could not submit. Try again or use Contact.");
        return;
      }
      setDoneId(data.ticketId || data.ticket?.id || "submitted");
      setSlaBy(data.slaAcknowledgeBy || null);
      setStep(5);
    } catch {
      setErr("Network error.");
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <Section>
        <Container className="py-16 text-center text-muted-foreground">
          Loading…
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container className="py-10 max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-brand-navy">Report an issue</h1>
          <Button variant="outline" asChild>
            <Link href={user.type === "client" ? "/dashboard/client" : "/dashboard/tradesperson"}>
              Back to dashboard
            </Link>
          </Button>
        </div>

        <Alert>
          <AlertDescription>
            <strong>What happens next:</strong> we log a priority ticket for our team.
            Target first acknowledgement is within <strong>{slaHours} hours</strong> during
            business hours (not a legal guarantee). For general questions, use{" "}
            <Link href="/contact" className="underline font-medium">
              Contact
            </Link>
            .
          </AlertDescription>
        </Alert>

        {err && (
          <Alert variant="destructive">
            <AlertDescription>{err}</AlertDescription>
          </Alert>
        )}

        {step < 5 && (
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span className={step >= 1 ? "font-semibold text-slate-900" : ""}>1. Job</span>
            <span>→</span>
            <span className={step >= 2 ? "font-semibold text-slate-900" : ""}>2. Category</span>
            <span>→</span>
            <span className={step >= 3 ? "font-semibold text-slate-900" : ""}>3. Details</span>
            <span>→</span>
            <span className={step >= 4 ? "font-semibold text-slate-900" : ""}>4. Send</span>
          </div>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Link to a job (optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecting a job helps us pull up the right chat thread and context.
              </p>
              <div className="space-y-2">
                <Label>Your jobs</Label>
                <Select
                  value={jobId || "__none__"}
                  onValueChange={(v) => setJobId(v === "__none__" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No specific job" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No specific job</SelectItem>
                    {jobs.map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        {j.trade} - {j.postcode} ({j.application_status || "-"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setStep(2)}>Continue</Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>What is this about?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>Continue</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Your contact &amp; details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label>Describe the issue</Label>
                <Textarea
                  rows={6}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Include dates, amounts, and what you expected vs what happened."
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)}>Review</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Review &amp; submit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <strong>Job:</strong>{" "}
                {jobId
                  ? jobs.find((j) => j.id === jobId)?.trade || jobId
                  : "Not linked"}
              </p>
              <p>
                <strong>Category:</strong> {CATEGORIES.find((c) => c.value === category)?.label}
              </p>
              <p>
                <strong>Details:</strong>
              </p>
              <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 border">{details}</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button onClick={() => void submit()} disabled={busy}>
                  {busy ? "Sending…" : "Submit ticket"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 5 && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-900">
              <strong>Ticket logged.</strong> Reference:{" "}
              <code className="text-xs">{doneId}</code>
              {slaBy ? (
                <>
                  <br />
                  Target first response by:{" "}
                  <strong>{new Date(slaBy).toLocaleString("en-GB")}</strong>
                </>
              ) : null}
              <br />
              Check your email for confirmation. Our team may reply from the address on your
              account.
            </AlertDescription>
          </Alert>
        )}
      </Container>
    </Section>
  );
}
