import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/notifications/email";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    console.log("Attempting to send email to:", email);

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px;">
          <h2>Your Verification Code:</h2>
          <div style="background: #e0e7ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #1e40af;">${code}</div>
          </div>
          <p>Enter this code on the verification page to complete your registration.</p>
        </div>
      </div>
    `;

    const info = await sendTransactionalEmail({
      to: email,
      subject: "Test Email - My Approved",
      html: emailContent,
    });
    console.log("Email sent successfully:", info.messageId);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId,
    });
  } catch (error: unknown) {
    console.error("Email sending failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
