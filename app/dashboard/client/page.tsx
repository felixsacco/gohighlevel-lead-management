"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Home, MessageCircle, Star, Wrench } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import DashboardNav from "@/components/DashboardNav";
import DatabaseChatSystem from "@/components/DatabaseChatSystem";

const PostJobDialog = dynamic(() => import("@/components/PostJobDialog"), {
  ssr: false,
  loading: () => (
    <Button size="sm" disabled className="shrink-0">
      Post new job…
    </Button>
  ),
});

const ClientQuoteRequests = dynamic(() => import("@/components/ClientQuoteRequests"), {
  ssr: false,
  loading: () => (
    <p className="text-sm text-muted-foreground py-6">Loading quote requests…</p>
  ),
});
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface User {
  id: string;
  email: string;
  firstName: string;
  type: string;
}

type TradespersonEmbed = {
  id: string;
  first_name: string;
  last_name: string;
  trade: string;
  phone?: string;
  email?: string;
  years_experience?: number | null;
  hourly_rate?: number | null;
};

function embedTradesperson(
  tp: TradespersonEmbed | TradespersonEmbed[] | null | undefined,
): TradespersonEmbed | null {
  if (tp == null) return null;
  return Array.isArray(tp) ? tp[0] ?? null : tp;
}

interface JobApplicationRow {
  id: string;
  status: string;
  quotation_amount: number;
  quotation_notes?: string | null;
  applied_at?: string | null;
  accepted_at?: string | null;
  tradespeople?: TradespersonEmbed | TradespersonEmbed[] | null;
}

interface Job {
  id: string;
  trade: string;
  job_description: string;
  postcode: string;
  budget: number;
  budget_type: string;
  preferred_date: string;
  status: string;
  is_approved: boolean;
  created_at: string;
  application_status?: string | null;
  tradespeople?: TradespersonEmbed | TradespersonEmbed[] | null;
  job_applications?: JobApplicationRow[] | null;
  quotation_amount?: number;
  is_completed?: boolean;
  assigned_tradesperson_id?: string | null;
}

export default function ClientDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decisionBusyId, setDecisionBusyId] = useState<string | null>(null);
  const [decisionError, setDecisionError] = useState("");
  const [activitySummary, setActivitySummary] = useState<{
    pendingApplications: number;
    openLiveJobs: number;
  } | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [profilePhotoBusy, setProfilePhotoBusy] = useState(false);
  const [profilePhotoMsg, setProfilePhotoMsg] = useState("");
  const [completeJob, setCompleteJob] = useState<Job | null>(null);
  const [completeRating, setCompleteRating] = useState(0);
  const [completeReview, setCompleteReview] = useState("");
  const [completeBusy, setCompleteBusy] = useState(false);
  const [completeError, setCompleteError] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const router = useRouter();

  const loadChatUnreadCount = useCallback(async (clientId: string) => {
    try {
      const res = await fetch(
        `/api/chat/unread-count?userId=${encodeURIComponent(clientId)}&userType=client`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as { unreadCount?: number };
      if (res.ok) {
        setChatUnreadCount(Number(data.unreadCount ?? 0));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const loadActivitySummary = useCallback(async (clientId: string) => {
    try {
      const res = await fetch(
        `/api/client/dashboard-summary?userId=${encodeURIComponent(clientId)}`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as {
        pendingApplications?: number;
        openLiveJobs?: number;
      };
      if (res.ok) {
        setActivitySummary({
          pendingApplications: Number(data.pendingApplications ?? 0),
          openLiveJobs: Number(data.openLiveJobs ?? 0),
        });
      }
    } catch {
      // non-blocking
    }
  }, []);

  const loadJobs = useCallback(async (clientId: string) => {
    setError("");
    try {
      const res = await fetch(
        `/api/client/jobs?userId=${encodeURIComponent(clientId)}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load your jobs.");
        setJobs([]);
        return;
      }
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch {
      setError("Network error loading jobs.");
      setJobs([]);
    }
  }, []);

  const handleApplicationDecision = useCallback(
    async (clientId: string, applicationId: string, action: "approve" | "reject") => {
      if (
        action === "reject" &&
        !window.confirm(
          "Decline this application? The tradesperson will be notified by email.",
        )
      ) {
        return;
      }
      if (
        action === "approve" &&
        !window.confirm(
          "Accept this quote and assign this tradesperson? Other applicants for this job will be declined automatically.",
        )
      ) {
        return;
      }
      setDecisionError("");
      setDecisionBusyId(applicationId);
      try {
        const res = await fetch("/api/client/approve-quotation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId, action, clientId }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setDecisionError(data.error || "Could not update application.");
          return;
        }
        await loadJobs(clientId);
        await loadActivitySummary(clientId);
      } catch {
        setDecisionError("Network error while updating application.");
      } finally {
        setDecisionBusyId(null);
      }
    },
    [loadJobs, loadActivitySummary],
  );

  const openCompleteDialog = (job: Job) => {
    setCompleteError("");
    setCompleteRating(0);
    setCompleteReview("");
    setCompleteJob(job);
  };

  const submitJobComplete = async () => {
    if (!user || !completeJob) return;
    if (completeRating < 1 || completeRating > 5) {
      setCompleteError("Please choose a star rating from 1 to 5.");
      return;
    }
    if (completeReview.trim().length < 10) {
      setCompleteError("Please write a short review (at least 10 characters).");
      return;
    }
    setCompleteBusy(true);
    setCompleteError("");
    try {
      const res = await fetch("/api/jobs/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: completeJob.id,
          completedBy: "client",
          rating: completeRating,
          reviewText: completeReview.trim(),
          reviewerType: "client",
          reviewerId: user.id,
        }),
      });
      const data = (await res.json()) as { error?: string; details?: string };
      if (!res.ok) {
        setCompleteError(
          [data.error, data.details].filter(Boolean).join(" — ") ||
            "Could not mark the job complete.",
        );
        return;
      }
      setCompleteJob(null);
      await loadJobs(user.id);
      await loadActivitySummary(user.id);
    } catch {
      setCompleteError("Network error.");
    } finally {
      setCompleteBusy(false);
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.replace("/login/client");
      return;
    }
    let parsed: User;
    try {
      parsed = JSON.parse(raw) as User;
    } catch {
      router.replace("/login/client");
      return;
    }
    if (parsed.type !== "client" || !parsed.id) {
      router.replace("/login/client");
      return;
    }
    setUser(parsed);
    void (async () => {
      await Promise.all([loadJobs(parsed.id), loadActivitySummary(parsed.id)]);
      try {
        const pr = await fetch(
          `/api/client/profile?clientId=${encodeURIComponent(parsed.id)}`,
          { cache: "no-store" },
        );
        const pj = (await pr.json()) as {
          client?: { profile_photo_url?: string | null };
        };
        if (pr.ok && pj.client?.profile_photo_url) {
          setProfilePhotoUrl(pj.client.profile_photo_url);
        }
      } catch {
        /* optional column */
      }
      setLoading(false);
    })();
  }, [router, loadJobs, loadActivitySummary]);

  useEffect(() => {
    if (!user?.id) return;
    void loadChatUnreadCount(user.id);
    const interval = setInterval(() => void loadChatUnreadCount(user.id), 10000);
    return () => clearInterval(interval);
  }, [user?.id, loadChatUnreadCount]);

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-GB");
    } catch {
      return "—";
    }
  };

  const statusLabel = (job: Job) => {
    if (job.is_completed) return "Completed";
    if (job.application_status === "in_progress") return "In progress";
    if (job.application_status === "open" && job.is_approved) return "Live — accepting applications";
    if (job.is_approved === false || job.status === "pending_approval")
      return "Pending approval";
    if (job.status === "rejected") return "Rejected";
    return job.application_status || job.status || "—";
  };

  if (!user && loading) {
    return (
      <Section>
        <Container className="py-16 text-center text-muted-foreground">
          Loading your dashboard…
        </Container>
      </Section>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />
      <Section>
        <Container className="py-8 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Client dashboard</h1>
              <p className="text-slate-600">
                Welcome back{user.firstName ? `, ${user.firstName}` : ""}. Post a job or track existing work.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <PostJobDialog
                onJobPosted={() => {
                  void loadJobs(user.id);
                  void loadActivitySummary(user.id);
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-medium"
                onClick={() => setShowChat(true)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat with tradesperson
                {chatUnreadCount > 0 ? (
                  <span className="ml-2 rounded-full bg-amber-600 px-2 py-0.5 text-xs text-white">
                    {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                  </span>
                ) : null}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {decisionError && (
            <Alert variant="destructive">
              <AlertDescription>{decisionError}</AlertDescription>
            </Alert>
          )}

          {activitySummary && activitySummary.pendingApplications > 0 && (
            <Alert className="border-amber-300 bg-amber-50 text-amber-950">
              <Clock className="h-4 w-4" />
              <AlertDescription className="ml-2">
                You have{" "}
                <strong>{activitySummary.pendingApplications}</strong> pending
                application
                {activitySummary.pendingApplications === 1 ? "" : "s"} across{" "}
                <strong>{activitySummary.openLiveJobs}</strong> live job
                {activitySummary.openLiveJobs === 1 ? "" : "s"} waiting for your
                decision. Review them in <strong>My jobs</strong> below.
              </AlertDescription>
            </Alert>
          )}

          <Alert className="border-slate-200 bg-slate-50">
            <AlertDescription>
              Problem with a job, quote, or payment?{" "}
              <Link href="/report-issue" className="font-medium text-slate-900 underline">
                Report an issue
              </Link>
              {" · "}
              <Link href="/contact" className="font-medium text-slate-900 underline">
                Contact support
              </Link>
              {" · "}
              <Link href="/notifications" className="font-medium text-slate-900 underline">
                Notifications
              </Link>
              {" — include your job trade and postcode so we can help quickly."}{" "}
              After you assign a tradesperson, use{" "}
              <strong>Chat with tradesperson</strong> above to message them about the job.
            </AlertDescription>
          </Alert>

          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Customer photo (optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>
                Paste a public image URL (for example from your Google profile or a
                photo host). Tradespeople you hire will see this on job details to
                recognise you.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  placeholder="https://…"
                  value={profilePhotoUrl}
                  onChange={(e) => setProfilePhotoUrl(e.target.value)}
                  className="sm:flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={profilePhotoBusy || !user}
                  onClick={async () => {
                    if (!user) return;
                    setProfilePhotoBusy(true);
                    setProfilePhotoMsg("");
                    try {
                      const res = await fetch("/api/client/profile", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          clientId: user.id,
                          profilePhotoUrl: profilePhotoUrl.trim() || null,
                        }),
                      });
                      const data = (await res.json()) as { error?: string };
                      if (!res.ok) {
                        setProfilePhotoMsg(data.error || "Could not save.");
                        return;
                      }
                      setProfilePhotoMsg("Saved.");
                    } catch {
                      setProfilePhotoMsg("Network error.");
                    } finally {
                      setProfilePhotoBusy(false);
                    }
                  }}
                >
                  {profilePhotoBusy ? "Saving…" : "Save photo URL"}
                </Button>
              </div>
              {profilePhotoMsg ? (
                <p className="text-xs text-slate-700">{profilePhotoMsg}</p>
              ) : null}
              {profilePhotoUrl.trim() ? (
                <div className="flex items-center gap-3 pt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profilePhotoUrl.trim()}
                    alt="Preview"
                    className="h-14 w-14 rounded-full object-cover border"
                  />
                  <span className="text-xs">Preview</span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Tabs defaultValue="jobs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="jobs">My jobs</TabsTrigger>
              <TabsTrigger value="quotes">Quote requests</TabsTrigger>
            </TabsList>

            <TabsContent value="jobs" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">Your jobs</CardTitle>
                  <Badge variant="secondary">{jobs.length} total</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {jobs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Wrench className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                      <p className="mb-4">You have not posted a job yet.</p>
                      <PostJobDialog
                        onJobPosted={() => {
                          void loadJobs(user.id);
                          void loadActivitySummary(user.id);
                        }}
                      />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Trade</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applications</TableHead>
                          <TableHead>Assigned</TableHead>
                          <TableHead>Posted</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job) => {
                          const apps = job.job_applications ?? [];
                          const assigned = embedTradesperson(job.tradespeople);
                          const canMarkComplete =
                            job.application_status === "in_progress" &&
                            !job.is_completed &&
                            Boolean(job.assigned_tradesperson_id);
                          return (
                          <TableRow key={job.id}>
                            <TableCell className="font-medium">{job.trade}</TableCell>
                            <TableCell>{job.postcode}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{statusLabel(job)}</Badge>
                            </TableCell>
                            <TableCell className="text-sm align-top max-w-[320px]">
                              {apps.length === 0 ? (
                                <span className="text-muted-foreground">None yet</span>
                              ) : (
                                <ul className="space-y-3 list-none m-0 p-0">
                                  {apps.map((app) => {
                                    const tp = embedTradesperson(app.tradespeople);
                                    const name = tp
                                      ? `${tp.first_name} ${tp.last_name}`
                                      : "Tradesperson";
                                    const jobLocked =
                                      Boolean(job.assigned_tradesperson_id) ||
                                      job.application_status === "in_progress";
                                    const canDecide =
                                      app.status === "pending" && !jobLocked;
                                    const busy = decisionBusyId === app.id;
                                    return (
                                      <li
                                        key={app.id}
                                        className="rounded-lg border border-slate-200 bg-white p-3 space-y-2"
                                      >
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                          <div>
                                            <span className="font-medium text-slate-800">{name}</span>
                                            {tp?.trade ? (
                                              <span className="block text-xs text-muted-foreground">
                                                {tp.trade}
                                              </span>
                                            ) : null}
                                          </div>
                                          <Badge variant="secondary" className="text-[10px] shrink-0">
                                            {app.status}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-slate-700">
                                          <span className="font-semibold text-slate-900">Quote:</span> £
                                          {Number(app.quotation_amount).toFixed(2)}
                                        </p>
                                        {tp?.years_experience != null ? (
                                          <p className="text-xs text-muted-foreground">
                                            Experience: {tp.years_experience} years
                                            {tp.hourly_rate != null
                                              ? ` · £${tp.hourly_rate}/hr`
                                              : ""}
                                          </p>
                                        ) : null}
                                        {tp?.phone ? (
                                          <p className="text-xs text-muted-foreground">
                                            Phone: {tp.phone}
                                          </p>
                                        ) : null}
                                        {tp?.email ? (
                                          <p className="text-xs text-muted-foreground break-all">
                                            Email: {tp.email}
                                          </p>
                                        ) : null}
                                        {app.quotation_notes ? (
                                          <div className="text-xs rounded-md bg-slate-50 p-2 text-slate-700 border border-slate-100">
                                            <span className="font-semibold text-slate-900">Their message:</span>{" "}
                                            {app.quotation_notes}
                                          </div>
                                        ) : null}
                                        {app.applied_at ? (
                                          <p className="text-[10px] text-muted-foreground">
                                            Applied {formatDate(app.applied_at)}
                                          </p>
                                        ) : null}
                                        {canDecide && user ? (
                                          <div className="flex flex-wrap gap-2 pt-1">
                                            <Button
                                              type="button"
                                              size="sm"
                                              className="h-8 text-xs"
                                              disabled={busy}
                                              onClick={() =>
                                                void handleApplicationDecision(
                                                  user.id,
                                                  app.id,
                                                  "approve",
                                                )
                                              }
                                            >
                                              {busy ? "…" : "Approve & assign"}
                                            </Button>
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              className="h-8 text-xs text-destructive border-destructive/40 hover:bg-destructive/10"
                                              disabled={busy}
                                              onClick={() =>
                                                void handleApplicationDecision(
                                                  user.id,
                                                  app.id,
                                                  "reject",
                                                )
                                              }
                                            >
                                              Decline
                                            </Button>
                                          </div>
                                        ) : null}
                                        {app.status === "pending" && jobLocked ? (
                                          <p className="text-[10px] text-amber-700">
                                            This job already has an assigned tradesperson.
                                          </p>
                                        ) : null}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {assigned ? (
                                <>
                                  {assigned.first_name} {assigned.last_name}
                                  <span className="block text-xs text-muted-foreground">
                                    {assigned.trade}
                                  </span>
                                </>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              <Clock className="w-3.5 h-3.5 inline mr-1" />
                              {formatDate(job.created_at)}
                            </TableCell>
                            <TableCell className="text-right align-top">
                              {canMarkComplete ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="default"
                                  className="shrink-0"
                                  onClick={() => openCompleteDialog(job)}
                                >
                                  Mark complete & review
                                </Button>
                              ) : job.is_completed ? (
                                <span className="text-xs text-muted-foreground">Completed</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quotes">
              <ClientQuoteRequests clientEmail={user.email} clientId={user.id} />
            </TabsContent>
          </Tabs>
        </Container>
      </Section>

      <Dialog
        open={completeJob !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCompleteJob(null);
            setCompleteError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Mark job complete</DialogTitle>
            <DialogDescription>
              {completeJob
                ? `Rate and review ${completeJob.trade} in ${completeJob.postcode}. The tradesperson will be notified and you will receive your invoice summary by email.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {completeJob ? (
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-slate-900">Your rating</Label>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      onClick={() => setCompleteRating(n)}
                      aria-label={`${n} stars`}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          n <= completeRating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="complete-review">Your review</Label>
                <Textarea
                  id="complete-review"
                  rows={4}
                  className="mt-2"
                  placeholder="What went well? Would you hire them again?"
                  value={completeReview}
                  onChange={(e) => setCompleteReview(e.target.value)}
                />
              </div>
              {completeError ? (
                <Alert variant="destructive">
                  <AlertDescription>{completeError}</AlertDescription>
                </Alert>
              ) : null}
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCompleteJob(null)}
              disabled={completeBusy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void submitJobComplete()}
              disabled={completeBusy}
            >
              {completeBusy ? "Submitting…" : "Submit & mark complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {user && showChat ? (
        <DatabaseChatSystem
          userId={user.id}
          userType="client"
          isOpen={showChat}
          onClose={() => setShowChat(false)}
        />
      ) : null}
    </div>
  );
}
