export type VerificationStatus =
  | "pending_documents"
  | "pending_review"
  | "approved"
  | "rejected";

export type VerificationDocument = {
  doc_type: string;
  status?: string | null;
  expiry_date?: string | null;
  doc_number?: string | null;
};

export type VerificationInput = {
  trade: string;
  documents: VerificationDocument[];
  nowIso?: string;
};

const TRADE_CARD_REQUIRED = ["plumber", "electrician", "aircon engineer"];

function norm(s: unknown): string {
  return String(s || "").trim().toLowerCase();
}

function hasDoc(docs: VerificationDocument[], type: string): VerificationDocument | null {
  const t = norm(type);
  return docs.find((d) => norm(d.doc_type) === t) || null;
}

function isInsuranceValid(doc: VerificationDocument | null, now: Date): boolean {
  if (!doc) return false;
  const statusOk = !doc.status || norm(doc.status) === "approved";
  if (!statusOk) return false;
  const exp = String(doc.expiry_date || "").trim();
  if (!exp) return false;
  const expDate = new Date(exp);
  if (Number.isNaN(expDate.getTime())) return false;
  // End-of-day safety so same-day expiry still counts.
  expDate.setHours(23, 59, 59, 999);
  return expDate.getTime() >= now.getTime();
}

function isDocApproved(doc: VerificationDocument | null): boolean {
  if (!doc) return false;
  return !doc.status || norm(doc.status) === "approved";
}

export function evaluateVerificationState(input: VerificationInput): {
  nextStatus: VerificationStatus;
  autoApproved: boolean;
  reason: string;
} {
  const docs = input.documents || [];
  const now = input.nowIso ? new Date(input.nowIso) : new Date();

  const idDoc = hasDoc(docs, "id");
  const qualificationDoc = hasDoc(docs, "qualification");
  const insuranceDoc = hasDoc(docs, "insurance");
  const tradeCardDoc = hasDoc(docs, "trade_card");
  const needsTradeCard = TRADE_CARD_REQUIRED.includes(norm(input.trade));

  if (!idDoc || !qualificationDoc || !insuranceDoc || (needsTradeCard && !tradeCardDoc)) {
    return {
      nextStatus: "pending_documents",
      autoApproved: false,
      reason: "required_documents_missing",
    };
  }

  const allApproved =
    isDocApproved(idDoc) &&
    isDocApproved(qualificationDoc) &&
    isInsuranceValid(insuranceDoc, now) &&
    (!needsTradeCard || isDocApproved(tradeCardDoc));

  if (allApproved) {
    return {
      nextStatus: "approved",
      autoApproved: true,
      reason: "all_required_documents_valid",
    };
  }

  return {
    nextStatus: "pending_review",
    autoApproved: false,
    reason: "documents_uploaded_manual_review_required",
  };
}

