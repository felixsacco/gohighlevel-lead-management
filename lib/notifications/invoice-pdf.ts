import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 50;
const MAX_CHARS = 82;

function wrapLines(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length <= maxChars) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = w.length > maxChars ? w.slice(0, maxChars) : w;
      while (line.length > maxChars) {
        lines.push(line.slice(0, maxChars));
        line = line.slice(maxChars);
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Serverless-safe PDF (no external .afm files — avoids PDFKit on Vercel). */
export async function buildInvoicePdfBuffer(params: {
  invoiceNumber: string;
  issueDate: string;
  billedToName: string;
  billedToEmail: string;
  description: string;
  amountLabel: string;
  footerNote?: string;
}): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([A4.w, A4.h]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = A4.h - MARGIN;
  const draw = (text: string, size: number, bold = false, color = rgb(0, 0, 0)) => {
    page.drawText(text, {
      x: MARGIN,
      y: y - size,
      size,
      font: bold ? fontBold : font,
      color,
    });
    y -= size + 6;
  };

  draw("MyApproved", 18, true);
  draw("Invoice / summary document", 14, true);
  y -= 4;
  draw(`Invoice number: ${params.invoiceNumber}`, 11);
  draw(`Date: ${params.issueDate}`, 11);
  y -= 6;
  draw("Bill to:", 11, true);
  draw(params.billedToName, 11);
  draw(params.billedToEmail, 11);
  y -= 6;
  draw("Description:", 11, true);
  for (const line of wrapLines(params.description, MAX_CHARS)) {
    draw(line, 11);
  }
  y -= 4;
  draw(`Amount: ${params.amountLabel}`, 12, true);
  y -= 12;
  const footer =
    params.footerNote ||
    "Issued by MyApproved (United Kingdom) for your records only. It is not a tax invoice unless separately issued by your tradesperson or their company. For platform support, reply to the email thread or contact the address shown in your MyApproved notification.";
  for (const line of wrapLines(footer, 88)) {
    page.drawText(line, {
      x: MARGIN,
      y: y - 9,
      size: 9,
      font,
      color: rgb(0.27, 0.27, 0.27),
    });
    y -= 11;
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
