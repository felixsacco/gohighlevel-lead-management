/** E.164 normalisation for UK phone numbers — reusable at capture and send points. */
export function normalizeUkPhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = String(input).trim().replace(/[\s()-]/g, "");
  if (!raw) return null;
  if (raw.startsWith("+")) {
    const digits = raw.slice(1).replace(/\D/g, "");
    return digits.length >= 10 ? `+${digits}` : null;
  }
  if (raw.startsWith("00")) {
    const digits = raw.slice(2).replace(/\D/g, "");
    return digits.length >= 10 ? `+${digits}` : null;
  }
  const digitsOnly = raw.replace(/\D/g, "");
  if (digitsOnly.startsWith("44") && digitsOnly.length >= 12) {
    return `+${digitsOnly}`;
  }
  if (digitsOnly.startsWith("0") && digitsOnly.length >= 10) {
    return `+44${digitsOnly.slice(1)}`;
  }
  if (digitsOnly.length >= 10 && digitsOnly.length <= 11 && !digitsOnly.startsWith("0")) {
    return `+44${digitsOnly}`;
  }
  return null;
}

/**
 * Phone masking helpers used when previewing leads to pay-per-lead
 * tradespeople before they unlock the full number.
 *
 *   maskUkPhoneNumber('07712345678')      -> '077xxxxxx78'
 *   maskUkPhoneNumber('+447712345678')    -> '+44 77xxxxxx78'
 *   maskUkPhoneNumber('07712 345 678')    -> '077xxxxxx78'
 *
 * The goal is for the tradesperson to be able to recognise their own
 * number when the customer eventually rings them back, while still being
 * unable to dial the customer until they have paid for the lead.
 */

function maskBetween(value: string, keepStart: number, keepEnd: number): string {
  if (value.length <= keepStart + keepEnd) {
    return value;
  }
  const start = value.slice(0, keepStart);
  const end = value.slice(value.length - keepEnd);
  const middleLength = value.length - keepStart - keepEnd;
  const middle = "x".repeat(Math.max(middleLength, 1));
  return `${start}${middle}${end}`;
}

export function maskUkPhoneNumber(input: string | null | undefined): string {
  if (!input) return "";
  const trimmed = String(input).trim();
  if (!trimmed) return "";

  // International format: +44XXXXXXXXXX
  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    if (digits.startsWith("44") && digits.length >= 11) {
      const local = digits.slice(2); // drop country code
      return `+44 ${maskBetween(local, 2, 2)}`;
    }
    return `+${maskBetween(digits, 2, 2)}`;
  }

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length >= 5) {
    // Standard UK mobile / local number, e.g. 07712345678 -> 077xxxxxx78
    return maskBetween(digitsOnly, 3, 2);
  }

  return "x".repeat(trimmed.length);
}
