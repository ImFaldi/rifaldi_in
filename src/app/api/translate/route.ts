import { NextRequest, NextResponse } from "next/server";

type TranslateRequest = {
  text?: string;
  source?: string;
  target?: string;
};

function extractTranslatedText(payload: unknown): string | null {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return null;

  const segments = payload[0] as unknown[];
  const text = segments
    .map((segment) => (Array.isArray(segment) ? segment[0] : ""))
    .filter((part): part is string => typeof part === "string")
    .join("")
    .trim();

  return text || null;
}

export async function POST(request: NextRequest) {
  let body: TranslateRequest;

  try {
    body = (await request.json()) as TranslateRequest;
  } catch {
    return NextResponse.json({ message: "Body JSON tidak valid." }, { status: 400 });
  }

  const text = body.text?.trim() ?? "";
  const source = body.source?.trim() || "id";
  const target = body.target?.trim() || "en";

  if (!text) {
    return NextResponse.json({ translatedText: "" });
  }

  try {
    const url =
      "https://translate.googleapis.com/translate_a/single" +
      `?client=gtx&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent": "rifaldi-dashboard/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ translatedText: text });
    }

    const payload = (await response.json()) as unknown;
    const translatedText = extractTranslatedText(payload) ?? text;

    return NextResponse.json({ translatedText });
  } catch {
    return NextResponse.json({ translatedText: text });
  }
}
