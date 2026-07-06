import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { name, email, subject, phone, country, message } = await req.json();

    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { success: false, error: "Email service not configured. Please contact the administrator." },
        { status: 503 }
      );
    }

    const resend = new Resend(resendApiKey);

    const data = await resend.emails.send({
      from: "Calqulate.net <krushal.barasiya@calqulate.net>",
      to: "krushal.barasiya@calqulate.net",
      replyTo: email,
      subject: `New Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
          <h2 style="color: #0f172a;">📩 New Contact Form Submission</h2>
          <p style="color: #334155;">You have received a new inquiry from your website <b>Calqulate.net</b>.</p>

          <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0;"><strong>Name:</strong></td>
              <td>${name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;"><strong>Email:</strong></td>
              <td><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0;"><strong>Phone:</strong></td>
              <td>${phone || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;"><strong>Country:</strong></td>
              <td>${country}</td>
            </tr>
          </table>

          <div style="margin-top: 20px;">
            <strong>Message:</strong>
            <p style="background-color: #fff; padding: 10px 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
              ${message}
            </p>
          </div>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            This message was automatically sent from your website contact form.<br>
            <b>Calqulate.net</b> © ${new Date().getFullYear()}
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Resend Error:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
