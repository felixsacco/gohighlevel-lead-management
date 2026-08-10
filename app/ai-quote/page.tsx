"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";

export default function AIQuotePage() {
  const [loading, setLoading] = useState(false);
  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-semibold">AI Quote</h1>
        <p className="text-gray-600">Get an instant quote with AI assistance.</p>
      </Container>
    </Section>
  );
}
