import { NextRequest, NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  company?: string;
  subject?: string;
  message?: string;
  website?: string;
};

function sanitize(value: string | undefined, maxLength: number) {
  return (value ?? "").trim().slice(0, maxLength);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  let body: ContactPayload;

  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ message: "Body JSON tidak valid." }, { status: 400 });
  }

  const website = sanitize(body.website, 120);
  if (website) {
    return NextResponse.json({ ok: true });
  }

  const name = sanitize(body.name, 120);
  const email = sanitize(body.email, 160).toLowerCase();
  const company = sanitize(body.company, 160);
  const subject = sanitize(body.subject, 180);
  const message = sanitize(body.message, 4000);

  if (!name || !email || !message) {
    return NextResponse.json({ message: "Nama, email, dan pesan wajib diisi." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "Format email tidak valid." }, { status: 400 });
  }

  const resendApiKey = process.env.RESEND_API_KEY ?? "";
  const toEmail = process.env.CONTACT_TO_EMAIL ?? process.env.NEXT_PUBLIC_SOCIAL_EMAIL ?? "";
  const fromEmail = process.env.CONTACT_FROM_EMAIL ?? "Portfolio Contact <onboarding@resend.dev>";

  if (!resendApiKey || !toEmail) {
    return NextResponse.json(
      {
        message:
          "Konfigurasi email belum lengkap. Isi RESEND_API_KEY dan CONTACT_TO_EMAIL (atau NEXT_PUBLIC_SOCIAL_EMAIL).",
      },
      { status: 500 }
    );
  }

  const safeSubject = subject || `Pesan baru dari ${name}`;
  const plainText = [
    "Pesan baru dari form Contact website.",
    "",
    `Nama: ${name}`,
    `Email: ${email}`,
    `Perusahaan: ${company || "-"}`,
    "",
    "Pesan:",
    message,
  ].join("\n");

  const html = `
    <h2>Pesan baru dari form Contact</h2>
    <p><strong>Nama:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Perusahaan:</strong> ${company || "-"}</p>
    <p><strong>Pesan:</strong></p>
    <p>${message.replace(/\n/g, "<br />")}</p>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: safeSubject,
        text: plainText,
        html,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          message: "Gagal mengirim email. Coba lagi sebentar.",
          detail: errorText.slice(0, 400),
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Gagal terhubung ke layanan email." }, { status: 502 });
  }
}
