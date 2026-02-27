// src/app/api/chat/route.ts
// Server-side Groq (Llama 3) handler to bypass Google's strict API quotas

import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { messages, context } = await req.json();

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === "your_groq_api_key_here") {
            return NextResponse.json(
                { error: "GROQ_API_KEY is not configured. Add it to .env.local and restart the server." },
                { status: 500 }
            );
        }

        const groq = new Groq({ apiKey });

        // Build the system instruction with live patient/implant context
        const systemInstruction = `You are BIO-MATCH OMNI's AI clinical assistant — an expert in orthopedic biomaterials and implant science.

CURRENT ANALYSIS CONTEXT:
${context}

STRICT RULES:
1. ALWAYS start every reply with: ⚠️ Educational purposes only. Always consult a qualified orthopedic surgeon or physician before making any medical decisions.
2. Only answer questions related to biomaterials, implants, orthopedics, bones, or this specific analysis.
3. Use clear, compassionate language — explain medical terms when used.
4. Never diagnose, prescribe, or replace professional medical advice.
5. Keep responses concise (3–5 sentences) unless detail is truly needed.`;

        // Map the conversation history format correctly for Groq (OpenAI-compatible)
        const formattedHistory = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
            role: m.role, // role is already "user" or "assistant" from the UI
            content: m.content,
        }));

        // Compile the final payload
        const finalMessages = [
            { role: "system", content: systemInstruction },
            ...formattedHistory,
            { role: "user", content: messages[messages.length - 1].content }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: finalMessages as any[],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 500,
        });

        const text = chatCompletion.choices[0]?.message?.content || "No response generated.";

        return NextResponse.json({ reply: text });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[/api/chat] Groq error:", message);
        return NextResponse.json({ error: `AI error: ${message}` }, { status: 500 });
    }
}
