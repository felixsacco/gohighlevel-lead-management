"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import SimpleQuoteRequests from "@/components/SimpleQuoteRequests";

interface Tradesperson {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  postcode: string;
  city: string;
  trade: string;
  years_experience: number;
  hourly_rate: number;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [tradespeople, setTradespeople] = useState<Tradesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!adminLoggedIn) {
      router.push("/admin/login");
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const response = await fetch("/api/admin/tradespeople");
      const data = await response.json();
      setTradespeople(data.tradespeople);
    } catch (error) {
      console.error("Error loading tradespeople: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        {loading ? (
          <p>Loading tradespeople...</p>
        ) : (
          <div>
            {tradespeople.map((tp) => (
              <Card key={tp.id}>
                <CardHeader>
                  <CardTitle>{tp.first_name} {tp.last_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Email: {tp.email}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
