"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Award, FileText, MessageSquare, ChevronDown, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";
import { useBioStore, ResultsReport } from "@/store/useBioStore";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const cardVariants: Variants = {
    hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
    visible: (i: number) => ({
        opacity: 1, y: 0, filter: "blur(0px)",
        transition: { duration: 0.55, ease: "easeOut" as const, delay: i * 0.12 },
    }),
};

// Score color (matches palette in store/CompatibilityRadar)
function scoreColor(s: number) {
    if (s >= 80) return "#00f3ff";
    if (s >= 60) return "#f39c12";
    if (s >= 40) return "#e67e22";
    return "#e74c3c";
}

// ─── Score Arc Mini Ring ──────────────────────────────────────────────────────
function MiniRing({ score, color }: { score: number; color: string }) {
    const r = 36;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    return (
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 88 88">
                <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
                <motion.circle
                    cx={44} cy={44} r={r}
                    fill="none" stroke={color} strokeWidth={7}
                    strokeLinecap="round"
                    strokeDasharray={`${circ} ${circ}`}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - dash }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                />
            </svg>
            <div className="relative flex flex-col items-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                    className="text-2xl font-black tabular-nums"
                    style={{ color }}
                >
                    {score}
                </motion.span>
                <span className="text-[8px] font-bold tracking-widest opacity-40" style={{ color }}>
                    /100
                </span>
            </div>
        </div>
    );
}

// ─── Stat Chip ───────────────────────────────────────────────────────────────
function StatChip({ label, value }: { label: string; value: number }) {
    const c = scoreColor(value);
    return (
        <div
            className="flex flex-col items-center gap-1 rounded-xl border px-3 py-2"
            style={{ borderColor: `${c}30`, background: `${c}08` }}
        >
            <span className="text-xs font-bold tabular-nums" style={{ color: c }}>{value}</span>
            <span className="text-[9px] uppercase tracking-wider text-white/30">{label}</span>
        </div>
    );
}

// ─── Prose Renderer (bolds **text** patterns) ─────────────────────────────────
function Prose({ text }: { text: string }) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
        <p className="text-sm leading-relaxed text-white/65">
            {parts.map((part, i) =>
                part.startsWith("**") && part.endsWith("**")
                    ? <strong key={i} className="font-bold text-white/90">{part.slice(2, -2)}</strong>
                    : <span key={i}>{part}</span>
            )}
        </p>
    );
}

// ─── Accordion Question Item ──────────────────────────────────────────────────
function QuestionItem({ question, index }: { question: string; index: number }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + index * 0.08, duration: 0.4, ease: "easeOut" }}
            className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]"
        >
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
            >
                {/* Number badge */}
                <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black"
                    style={{
                        background: "rgba(0,243,255,0.12)",
                        color: "#00f3ff",
                        border: "1px solid rgba(0,243,255,0.25)",
                    }}
                >
                    {index + 1}
                </span>
                <span className="flex-1 text-sm font-medium leading-snug text-white/75">{question}</span>
                <ChevronDown
                    size={14}
                    className="mt-1 shrink-0 text-white/30 transition-transform duration-300"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-white/5 px-4 pb-3 pt-2.5">
                            <p className="text-xs leading-relaxed text-white/40">
                                Write this question down before your consultation. Your surgeon or orthopaedic specialist
                                can give you the most personalised answer based on your full clinical history.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Glass Card Wrapper ───────────────────────────────────────────────────────
function ResultCard({
    icon: Icon,
    title,
    accent,
    custom,
    children,
}: {
    icon: LucideIcon;
    title: string;
    accent: string;
    custom: number;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            custom={custom}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4 rounded-2xl p-6"
            style={{
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                background: "rgba(10, 15, 20, 0.72)",
                border: `1px solid ${accent}28`,
                boxShadow: `0 0 40px rgba(0,0,0,0.5), 0 0 20px ${accent}0a inset`,
            }}
        >
            {/* Card header */}
            <div className="flex items-center gap-2.5">
                <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
                >
                    <Icon size={13} style={{ color: accent }} />
                </div>
                <span
                    className="text-[10px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: accent }}
                >
                    {title}
                </span>
            </div>

            <div className="h-px" style={{ background: `linear-gradient(to right, transparent, ${accent}20, transparent)` }} />

            {children}
        </motion.div>
    );
}

// ─── Perfect Match Card ───────────────────────────────────────────────────────
function PerfectMatchCard({ data, index }: { data: ResultsReport["perfectMatch"]; index: number }) {
    const c = scoreColor(data.overallScore);
    return (
        <ResultCard icon={Award} title="Perfect Match" accent={c} custom={index}>
            <div className="flex items-center gap-5">
                <MiniRing score={data.overallScore} color={c} />
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tight text-white">{data.materialLabel}</span>
                        <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                            style={{
                                background: `${data.materialColor}20`,
                                color: data.materialColor,
                                border: `1px solid ${data.materialColor}40`,
                            }}
                        >
                            {data.materialCategory}
                        </span>
                    </div>
                    <span
                        className="text-[10px] font-bold tracking-[0.25em]"
                        style={{ color: c }}
                    >
                        {data.rankLabel}
                    </span>
                    <div className="mt-1 flex items-center gap-1.5">
                        <TrendingUp size={11} className="text-white/30" />
                        <span className="text-[10px] text-white/30">Compatibility score</span>
                        <span className="text-[10px] font-bold" style={{ color: c }}>{data.overallScore}/100</span>
                    </div>
                </div>
            </div>

            {/* Stat chips */}
            <div className="grid grid-cols-4 gap-2">
                {data.topStats.map((s) => (
                    <StatChip key={s.label} label={s.label} value={s.value} />
                ))}
            </div>
        </ResultCard>
    );
}

// ─── Patient Note Card ────────────────────────────────────────────────────────
function PatientNoteCard({ note, index }: { note: string; index: number }) {
    return (
        <ResultCard icon={FileText} title="Patient Note" accent="#a78bfa" custom={index}>
            <Prose text={note} />
            <div className="flex items-center gap-2 rounded-lg border border-violet-500/15 bg-violet-500/5 px-3 py-2">
                <Sparkles size={11} className="shrink-0 text-violet-400" />
                <p className="text-[10px] leading-relaxed text-white/35">
                    This note is generated from bio-mechanical scoring data. Always consult your orthopaedic
                    surgeon before making clinical decisions.
                </p>
            </div>
        </ResultCard>
    );
}

// ─── Doctor Questions Card ────────────────────────────────────────────────────
function DoctorQuestionsCard({ questions, index }: { questions: string[]; index: number }) {
    return (
        <ResultCard icon={MessageSquare} title="Questions to Ask Your Doctor" accent="#34d399" custom={index}>
            <p className="text-[11px] text-white/35">
                Bring these to your next consultation — they are tailored to your specific match data.
            </p>
            <div className="flex flex-col gap-2">
                {questions.map((q, i) => (
                    <QuestionItem key={i} question={q} index={i} />
                ))}
            </div>
        </ResultCard>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ResultsPanel() {
    const { results, isGeneratingResults } = useBioStore();

    if (isGeneratingResults) {
        return (
            <div className="flex flex-col items-center gap-4 py-16">
                <div className="relative flex h-14 w-14 items-center justify-center">
                    <div
                        className="absolute inset-0 animate-spin rounded-full"
                        style={{ border: "2px solid transparent", borderTopColor: "#00f3ff" }}
                    />
                    <div
                        className="absolute inset-2 animate-spin rounded-full"
                        style={{
                            border: "1px solid transparent",
                            borderTopColor: "#a78bfa",
                            animationDirection: "reverse",
                            animationDuration: "0.7s",
                        }}
                    />
                    <Sparkles size={16} className="text-cyan-400" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-400/60">
                    Generating Clinical Report…
                </p>
            </div>
        );
    }

    if (!results) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="results-panel"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col gap-4"
            >
                <PerfectMatchCard data={results.perfectMatch} index={0} />
                <PatientNoteCard note={results.patientNote} index={1} />
                <DoctorQuestionsCard questions={results.doctorQuestions} index={2} />
            </motion.div>
        </AnimatePresence>
    );
}
