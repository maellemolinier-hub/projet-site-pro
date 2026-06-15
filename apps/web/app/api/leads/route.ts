export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  city: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { name, email, phone, city, message } = parsed.data;
  const date = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px;">
      <div style="background:#1e3a5f;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;margin:-24px -24px 24px;">
        <h2 style="margin:0;font-size:18px;">🔔 Nouveau lead ImmoExpert</h2>
        <p style="margin:4px 0 0;font-size:12px;opacity:.7;">${date}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;font-size:13px;color:#6b7280;width:100px">Nom</td><td style="font-weight:600;font-size:14px;">${name}</td></tr>
        <tr><td style="padding:8px 0;font-size:13px;color:#6b7280;">Email</td><td><a href="mailto:${email}" style="color:#2563eb;font-weight:600;">${email}</a></td></tr>
        ${phone ? `<tr><td style="padding:8px 0;font-size:13px;color:#6b7280;">Téléphone</td><td style="font-weight:600;">${phone}</td></tr>` : ""}
        ${city ? `<tr><td style="padding:8px 0;font-size:13px;color:#6b7280;">Ville</td><td style="font-weight:600;">${city}</td></tr>` : ""}
        ${message ? `<tr><td style="padding:8px 0;font-size:13px;color:#6b7280;vertical-align:top;">Message</td><td style="font-size:14px;">${message}</td></tr>` : ""}
      </table>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;">
        Ce lead provient du formulaire ImmoExpert · <a href="mailto:${email}">Répondre directement</a>
      </div>
    </div>
  `;

  const to = process.env.LEAD_EMAIL ?? "maelle.molinier@gmail.com";
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "ImmoExpert <leads@immoexpert.fr>",
          to: [to],
          reply_to: email,
          subject: `🔔 Nouveau lead — ${name} (${city ?? email})`,
          html,
        }),
      });
    } catch {
      console.error("Email send failed");
    }
  } else {
    console.log("Lead reçu (RESEND_API_KEY non configuré):", { name, email, phone, city });
  }

  return NextResponse.json({ success: true });
}
