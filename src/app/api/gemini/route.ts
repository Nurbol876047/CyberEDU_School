import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Ты — Қалқан-бот, добрый наставник по кибербезопасности на образовательной платформе «QALQAN AI» для школьников 5–7 классов (10–13 лет) из Казахстана.
Правила:
- Отвечай на русском языке, просто и дружелюбно, без сложных терминов (если термин нужен — объясни его одним предложением).
- Можно иногда вставлять короткие казахские слова-приветствия (Сәлем, жарайсың, керемет).
- Ответ короткий: 2–5 предложений, если не просят иначе.
- Никогда не давай инструкций по взлому, обходу защиты или чему-то опасному; переводи разговор на безопасное поведение.
- Если вопрос не о кибербезопасности или интернете — вежливо верни ученика к теме.
- Хвали за правильные ответы и поддерживай при ошибках.`;

export async function POST(req: Request) {
  let body: { prompt?: string; context?: string; json?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const prompt = (body.prompt ?? "").toString().slice(0, 4000);
  if (!prompt.trim()) {
    return NextResponse.json({ error: "empty_prompt" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "no_api_key", text: "" },
      { status: 503 },
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: body.json
        ? { responseMimeType: "application/json", temperature: 0.9 }
        : { temperature: 0.7, maxOutputTokens: 600 },
    });
    const full = body.context ? `Контекст: ${body.context}\n\n${prompt}` : prompt;
    const result = await model.generateContent(full);
    const text = result.response.text();
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[gemini]", message);
    return NextResponse.json({ error: "upstream", message }, { status: 502 });
  }
}
