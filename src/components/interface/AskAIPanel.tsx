"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { useBioStore, MATERIALS, BONE_TYPES } from "@/store/useBioStore";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

// ─── Build rich context string from store state ───────────────────────────────
function buildContext(
    patient: { name: string; age: string; bloodGroup: string; urgency: string },
    weight: number,
    boneType: string,
    materialSelected: string,
    compatibilityScore: number,
    breakdown: { stiffnessMatch: number; biocompatibility: number; osseointegration: number; corrosionResistance: number; weightLoad: number } | null
): string {
    const mat = MATERIALS.find((m) => m.id === materialSelected);
    const bone = BONE_TYPES.find((b) => b.id === boneType);
    return [
        `Patient: ${patient.name || "Unknown"}, Age: ${patient.age || "N/A"}, Blood Group: ${patient.bloodGroup || "N/A"}, Weight: ${weight} kg, Urgency: ${patient.urgency}`,
        `Target Bone: ${bone?.label ?? boneType}`,
        `Selected Biomaterial: ${mat?.label ?? materialSelected} (${mat?.category ?? "unknown"}, elastic modulus: ${mat?.elasticModulus ?? "?"} GPa, yield strength: ${mat?.yieldStrength ?? "?"} MPa)`,
        `Overall Compatibility Score: ${compatibilityScore}/100`,
        breakdown
            ? `Score Breakdown — Stiffness Match: ${breakdown.stiffnessMatch}, Biocompatibility: ${breakdown.biocompatibility}, Osseointegration: ${breakdown.osseointegration}, Corrosion Resistance: ${breakdown.corrosionResistance}, Weight Load: ${breakdown.weightLoad}`
            : "No breakdown available yet.",
    ].join("\n");
}

// ─── Disclaimer Banner ────────────────────────────────────────────────────────
export function MedicalDisclaimer() {
    return (
        <div
            className="flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5"
            style={{
                background: "rgba(251, 191, 36, 0.05)",
                borderColor: "rgba(251, 191, 36, 0.25)",
            }}
        >
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400" />
            <p className="text-[10px] leading-relaxed text-amber-200/60">
                <span className="font-bold text-amber-300">EDUCATIONAL PURPOSES ONLY.</span>{" "}
                This tool does not constitute medical advice. All information is for informational use only.
                Always consult a qualified orthopaedic surgeon or licensed physician before making any
                clinical decisions.
            </p>
        </div>
    );
}

// ─── Disclaimer Strip (used in header) ───────────────────────────────────────
export function DisclaimerStrip() {
    return (
        <div
            className="flex items-center justify-center gap-2 border-b px-8 py-2"
            style={{
                background: "rgba(251, 191, 36, 0.04)",
                borderColor: "rgba(251, 191, 36, 0.15)",
            }}
        >
            <AlertTriangle size={11} className="shrink-0 text-amber-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300/70">
                For Educational &amp; Informational Purposes Only — Not a substitute for professional medical advice. Consult your doctor.
            </span>
        </div>
    );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
    const isUser = msg.role === "user";

    // Parse disclaimer prefix out so we can render it styled
    const disclaimerPattern = /^⚠️ Educational purposes only\..*?medical decisions\.\n?/i;
    const hasDisclaimer = disclaimerPattern.test(msg.content);
    const bodyText = hasDisclaimer
        ? msg.content.replace(disclaimerPattern, "").trim()
        : msg.content;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
        >
            {/* Avatar */}
            <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border mt-1"
                style={
                    isUser
                        ? { background: "rgba(0,243,255,0.1)", borderColor: "rgba(0,243,255,0.25)" }
                        : { background: "rgba(168,139,250,0.1)", borderColor: "rgba(168,139,250,0.25)" }
                }
            >
                {isUser
                    ? <User size={11} style={{ color: "#00f3ff" }} />
                    : <Bot size={11} style={{ color: "#a78bfa" }} />
                }
            </div>

            <div className={`flex max-w-[85%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
                {/* AI disclaimer sub-header */}
                {!isUser && hasDisclaimer && (
                    <div className="flex items-center gap-1.5 rounded-md border border-amber-400/20 bg-amber-400/5 px-2 py-1">
                        <AlertTriangle size={9} className="text-amber-400" />
                        <span className="text-[9px] font-bold text-amber-300/80">
                            Educational purposes only · Consult your doctor
                        </span>
                    </div>
                )}

                {/* Message body */}
                <div
                    className="rounded-xl px-3 py-2.5 text-xs leading-relaxed"
                    style={
                        isUser
                            ? { background: "rgba(0,243,255,0.1)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,243,255,0.2)" }
                            : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.06)" }
                    }
                >
                    {isUser ? msg.content : bodyText}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main AskAI Panel ─────────────────────────────────────────────────────────
export default function AskAIPanel() {
    const { patient, weight, boneType, materialSelected, compatibilityScore, breakdown } = useBioStore();

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "Hi! I'm Bio-Match Omni's AI assistant. I can answer questions about your compatibility analysis, the selected biomaterial, or general orthopedic implant topics. What would you like to know?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const context = buildContext(patient, weight, boneType, materialSelected, compatibilityScore, breakdown);
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
                    context,
                }),
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), role: "assistant", content: data.reply },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: err instanceof Error ? err.message : "An unexpected error occurred. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Panel header */}
            <div className="flex items-center gap-2">
                <div
                    className="flex h-6 w-6 items-center justify-center rounded-lg"
                    style={{ background: "rgba(168,139,250,0.15)", border: "1px solid rgba(168,139,250,0.3)" }}
                >
                    <Sparkles size={11} style={{ color: "#a78bfa" }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-400">
                    Ask AI Assistant
                </span>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />

            {/* Disclaimer */}
            <MedicalDisclaimer />

            {/* Messages */}
            <div className="flex max-h-60 flex-col gap-3 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg} />
                    ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 pl-8"
                    >
                        <Loader2 size={12} className="animate-spin text-violet-400" />
                        <span className="text-[10px] text-white/30">AI is thinking…</span>
                    </motion.div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input row */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Ask about your implant analysis…"
                    disabled={isLoading}
                    className="flex-1 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-white/80 placeholder-white/20 outline-none transition focus:border-violet-400/40 focus:ring-1 focus:ring-violet-400/20 disabled:opacity-50"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-400/10 text-violet-300 transition hover:bg-violet-400/20 disabled:opacity-40"
                >
                    <Send size={13} />
                </button>
            </div>
        </div>
    );
}
