"use client";

import { useMemo } from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useBioStore } from "@/store/useBioStore";
import { clsx } from "clsx";

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
interface TooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; payload: { label: string } }>;
}

function CyberTooltip({ active, payload }: TooltipProps) {
    if (!active || !payload?.length) return null;
    const { value, payload: inner } = payload[0];
    return (
        <div
            className="rounded-lg px-3 py-2 text-xs"
            style={{
                background: "rgba(3,5,8,0.95)",
                border: "1px solid rgba(0,243,255,0.25)",
                color: "#00f3ff",
                boxShadow: "0 0 20px rgba(0,243,255,0.1)",
            }}
        >
            <p className="font-bold">{inner.label}</p>
            <p className="text-white/70">{value}/100</p>
        </div>
    );
}

// ─── Score Arc Ring ──────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = (score / 100) * circumference;

    const color =
        score >= 80 ? "#00f3ff" :
            score >= 60 ? "#f39c12" :
                score >= 40 ? "#e67e22" :
                    "#e74c3c";

    const label =
        score >= 80 ? "EXCELLENT" :
            score >= 60 ? "MODERATE" :
                score >= 40 ? "POOR" :
                    "CRITICAL";

    return (
        <div className="relative flex h-40 w-40 items-center justify-center mx-auto">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
                {/* Background ring */}
                <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                {/* Score arc */}
                <motion.circle
                    cx="64" cy="64" r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - strokeDash }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                />
            </svg>
            <div className="relative flex flex-col items-center">
                <motion.span
                    key={score}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="text-3xl font-bold tabular-nums"
                    style={{ color }}
                >
                    {score}
                </motion.span>
                <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 mt-0.5">
                    {label}
                </span>
            </div>
        </div>
    );
}

// ─── Stat Bar ────────────────────────────────────────────────────────────────
function StatBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
    const color =
        value >= 80 ? "#00f3ff" :
            value >= 60 ? "#f39c12" :
                "#e74c3c";

    return (
        <div className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-[10px] uppercase tracking-widest text-white/40">{label}</span>
            <div className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, delay, ease: "easeOut" }}
                />
            </div>
            <span className="w-8 text-right text-[10px] tabular-nums" style={{ color }}>
                {value}
            </span>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CompatibilityRadar() {
    const { breakdown, compatibilityScore, materialSelected } = useBioStore();

    // Memoize radar data to trigger recharts animation on material change
    const radarData = useMemo(
        () => breakdown?.radarAxes ?? [],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [materialSelected, breakdown]
    );

    const scoreColor =
        compatibilityScore >= 80 ? "text-cyan-400" :
            compatibilityScore >= 60 ? "text-yellow-400" :
                "text-red-400";

    return (
        <div className="flex flex-col gap-5">
            {/* Score ring */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={materialSelected}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    <ScoreRing score={compatibilityScore} />
                </motion.div>
            </AnimatePresence>

            {/* Radar chart — key forces React to remount → triggers Recharts' built-in animation */}
            {radarData.length > 0 && (
                <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                            key={materialSelected}  /* re-mounts on material change → smooth animation */
                            data={radarData}
                            margin={{ top: 4, right: 16, bottom: 4, left: 16 }}
                        >
                            <PolarGrid stroke="rgba(0,243,255,0.1)" gridType="polygon" />
                            <PolarAngleAxis
                                dataKey="label"
                                tick={{
                                    fill: "rgba(255,255,255,0.4)",
                                    fontSize: 9,
                                    fontWeight: "bold",
                                    fontFamily: "monospace",
                                }}
                            />
                            <Radar
                                name="Score"
                                dataKey="value"
                                stroke="#00f3ff"
                                fill="#00f3ff"
                                fillOpacity={0.12}
                                strokeWidth={1.5}
                                isAnimationActive
                                animationBegin={0}
                                animationDuration={700}
                                animationEasing="ease-out"
                                dot={false}
                            />
                            <Tooltip content={<CyberTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Stat bars */}
            {breakdown && (
                <div className="flex flex-col gap-2.5">
                    <StatBar label="Stiffness Match" value={breakdown.stiffnessMatch} delay={0.0} />
                    <StatBar label="Biocompat." value={breakdown.biocompatibility} delay={0.1} />
                    <StatBar label="Osseointegration" value={breakdown.osseointegration} delay={0.2} />
                    <StatBar label="Corrosion Resist." value={breakdown.corrosionResistance} delay={0.3} />
                    <StatBar label="Weight Load" value={breakdown.weightLoad} delay={0.4} />
                </div>
            )}

            {/* Empty state */}
            {!breakdown && (
                <div className={clsx("text-center text-xs tracking-widest", scoreColor, "opacity-40")}>
                    SELECT PARAMETERS TO ANALYZE
                </div>
            )}
        </div>
    );
}
