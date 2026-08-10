"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/badge";

type Row = {
  id: string;
  title: string;
  event_type: string;
  created_at: string;
  read_at: string | null;
  preview: string;
};

const RECEIPT_DOWNLOAD_TYPES = new Set([
  "invoice_sent_client",
  "invoice_sent_tradesperson",
  "payment_received",
]);

export default function NotificationsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [dashHref, setDashHref] = useState("/dashboard/client");
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async (uid: string) => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/notifications/inbox?userId=${encodeURIComponent(uid)}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Could not load notifications.");
        setItems([]);
        return;
      }
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setErr("Network error.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const u = JSON.parse(raw) as { id?: string; type?: string };
      if (!u.id) {
        router.replace("/");
        return;
      }
      setUserId(u.id);
      setDashHref(u.type === "tradesperson" ? "/dashboard/tradesperson" : "/dashboard/client");
      void load(u.id);
    } catch {
      router.replace("/");
    }
  }, [router, load]);

  const markRead = async (id: string) => {
    if (!userId) return;
    try {
      await fetch("/api/notifications/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      setItems((prev) =>
        prev.map((r) => (r.id === id ? { ...r, read_at: new Date().toISOString() } : r)),
      );
    } catch {
      /* ignore */
    }
  };

  return (
    <Section>
      <Container className="py-10 max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <Button variant="outline" asChild>
            <Link href={dashHref}>Dashboard</Link>
          </Button>
        </div>

        {err && (
          <Alert variant="destructive">
            <AlertDescription>{err}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No notifications yet, or the inbox table is not ready.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((r) => (
              <Card
                key={r.id}
                className={r.read_at ? "opacity-70" : "border-blue-200"}
                onClick={() => {
                  if (!r.read_at) void markRead(r.id);
                }}
              >
                <CardHeader className="py-3 pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold">{r.title}</CardTitle>
                    {!r.read_at && (
                      <Badge variant="default" className="shrink-0">
                        New
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-2 pb-4">
                  <p className="text-sm text-muted-foreground">{r.preview}</p>
                  {userId && RECEIPT_DOWNLOAD_TYPES.has(r.event_type) ? (
                    <p className="mt-3">
                      <a
                        className="text-sm font-medium text-blue-600 hover:underline"
                        href={`/api/notifications/receipt?userId=${encodeURIComponent(userId)}&logId=${encodeURIComponent(r.id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Download PDF receipt
                      </a>
                      <span className="text-xs text-muted-foreground block mt-1">
                        Same document as attached to your email.
                      </span>
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(r.created_at).toLocaleString("en-GB")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
