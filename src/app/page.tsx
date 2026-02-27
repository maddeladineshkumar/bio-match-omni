"use client";

import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Cpu, Dna, Heart, Zap, Layers, ClipboardList, FlaskConical, ChevronDown, Star, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import LayoutWrapper, { itemVariants } from "@/components/interface/LayoutWrapper";
import GlassPanel from "@/components/interface/GlassPanel";
import { useBioStore, MATERIALS, BONE_TYPES, ScoredMaterial } from "@/store/useBioStore";
import { useCyberSound } from "@/hooks/useCyberSound";
import { DisclaimerStrip } from "@/components/interface/AskAIPanel";



const BioModel = dynamic(() => import("@/components/canvas/BioModel"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-cyan-400" />
    </div>
  ),
});

const CompatibilityRadar = dynamic(
  () => import("@/components/interface/CompatibilityRadar"),
  { ssr: false }
);

const ResultsPanel = dynamic(
  () => import("@/components/interface/ResultsPanel"),
  { ssr: false }
);

const AskAIPanel = dynamic(
  () => import("@/components/interface/AskAIPanel"),
  { ssr: false }
);


const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_LEVELS = ["critical", "high", "moderate", "low"] as const;
const URGENCY_COLOR: Record<string, string> = {
  critical: "text-red-400 border-red-500/40 bg-red-500/10",
  high: "text-orange-400 border-orange-500/40 bg-orange-500/10",
  moderate: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  low: "text-green-400 border-green-500/40 bg-green-500/10",
};

function SectionLabel({ icon: Icon, label }: { icon: React.FC<{ size?: number; className?: string }>; label: string }) {
  return (
    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/70">
      <Icon size={11} />
      {label}
    </label>
  );
}

export default function HomePage() {
  const {
    patient, setPatient,
    boneType, setBoneType,
    weight, setWeight,
    materialSelected, setMaterial,
    compatibilityScore, breakdown,
    calculateCompatibility,
    results, isGeneratingResults, generateResults,
    hasAnalysed, allScores, runAnalysis,
  } = useBioStore();

  const { playHover, playClick, playSuccess, playWarning } = useCyberSound();
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Seed initial calculation on mount
  useEffect(() => { calculateCompatibility(); }, [calculateCompatibility]);

  // React to score changes for audio feedback
  useEffect(() => {
    if (!breakdown) return;
    if (compatibilityScore >= 75) playSuccess();
    else if (compatibilityScore < 40) playWarning();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compatibilityScore]);

  const handleAnalyse = () => {
    playClick();
    setIsAnalysing(true);
    setShowAlternatives(false);
    setTimeout(() => {
      runAnalysis();
      setIsAnalysing(false);
      playSuccess();
    }, 1200);
  };

  const scoreLabel =
    compatibilityScore >= 80 ? "HIGH COMPATIBILITY" :
      compatibilityScore >= 60 ? "MODERATE MATCH" :
        compatibilityScore >= 40 ? "POOR MATCH" :
          "INCOMPATIBLE";

  const scoreColor =
    compatibilityScore >= 80 ? "#00f3ff" :
      compatibilityScore >= 60 ? "#f39c12" :
        "#e74c3c";

  return (
    <LayoutWrapper>
      {/* ─── Header ─────────────────────────────────────── */}
      <motion.header
        variants={itemVariants}
        className="flex items-center justify-between border-b border-white/5 px-8 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10">
            <Dna size={16} className="text-cyan-400" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-[0.3em] text-white">
              BIO-MATCH <span className="text-cyan-400">OMNI</span>
            </h1>
            <p className="text-[10px] tracking-widest text-white/30">
              NEURAL COMPATIBILITY ENGINE v3.1
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {breakdown && (
            <motion.div
              key={compatibilityScore}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 rounded-full border px-3 py-1"
              style={{ borderColor: `${scoreColor}40`, background: `${scoreColor}10` }}
            >
              <div className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: scoreColor }} />
              <span className="text-[10px] font-bold tracking-widest" style={{ color: scoreColor }}>
                {scoreLabel}
              </span>
            </motion.div>
          )}
          <div className="h-4 w-px bg-white/10" />
          <Cpu size={14} className="text-cyan-400/50" />
        </div>
      </motion.header>

      {/* ─── Medical Disclaimer Strip ─────────────────────── */}
      <DisclaimerStrip />

      {/* ─── Main 3-Column Grid ─────────────────────────── */}
      <main className="grid min-h-[calc(100vh-65px)] grid-cols-[340px_1fr_320px]">

        {/* ══ LEFT: Patient Inputs ══════════════════════════ */}
        <motion.aside variants={itemVariants} className="border-r border-white/5 p-5 overflow-y-auto">
          <GlassPanel neonBorder animate={false} className="flex flex-col gap-5">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                  Patient Data
                </span>
              </div>
              <span className="rounded border border-cyan-400/20 bg-cyan-400/5 px-2 py-0.5 text-[9px] text-cyan-400/70">
                INPUT MODE
              </span>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <SectionLabel icon={Heart} label="Patient Name" />
              <input
                type="text" placeholder="Enter full name..."
                value={patient.name}
                onChange={(e) => setPatient({ name: e.target.value })}
                onMouseEnter={playHover}
                className="rounded-lg border border-white/5 bg-white/5 px-3 py-2.5 text-sm text-white/90 placeholder-white/20 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
              />
            </div>

            {/* Age */}
            <div className="flex flex-col gap-1.5">
              <SectionLabel icon={Cpu} label="Age" />
              <input
                type="number" placeholder="Age in years..."
                value={patient.age}
                onChange={(e) => setPatient({ age: e.target.value })}
                onMouseEnter={playHover}
                className="rounded-lg border border-white/5 bg-white/5 px-3 py-2.5 text-sm text-white/90 placeholder-white/20 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
              />
            </div>

            {/* Weight */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <SectionLabel icon={Activity} label="Patient Weight" />
                <span className="text-xs tabular-nums text-cyan-300">{weight} kg</span>
              </div>
              <input
                type="range" min={30} max={180} step={1}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] text-white/20">
                <span>30 kg</span><span>180 kg</span>
              </div>
            </div>

            {/* Blood Group */}
            <div className="flex flex-col gap-1.5">
              <SectionLabel icon={Dna} label="Blood Group" />
              <div className="grid grid-cols-4 gap-1.5">
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => { setPatient({ bloodGroup: bg }); playClick(); }}
                    onMouseEnter={playHover}
                    className={`rounded-lg border py-1.5 text-xs font-bold transition-all ${patient.bloodGroup === bg
                      ? "border-cyan-400/60 bg-cyan-400/20 text-cyan-300 shadow-lg shadow-cyan-400/10"
                      : "border-white/5 bg-white/5 text-white/40 hover:border-cyan-400/30 hover:text-white/70"
                      }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div className="flex flex-col gap-1.5">
              <SectionLabel icon={Zap} label="Urgency Level" />
              <div className="grid grid-cols-2 gap-1.5">
                {URGENCY_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => { setPatient({ urgency: level }); playClick(); }}
                    onMouseEnter={playHover}
                    className={`rounded-lg border px-2 py-2 text-[10px] font-semibold uppercase tracking-widest transition-all ${patient.urgency === level
                      ? URGENCY_COLOR[level]
                      : "border-white/5 bg-transparent text-white/30 hover:border-white/10 hover:text-white/50"
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>


            {/* Give Results button */}
            <button
              onClick={() => { generateResults(); playClick(); }}
              disabled={isGeneratingResults || !breakdown}
              onMouseEnter={playHover}
              className="group relative overflow-hidden rounded-xl border border-emerald-400/40 bg-emerald-400/10 py-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-300 transition-all hover:bg-emerald-400/20 hover:shadow-lg hover:shadow-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isGeneratingResults ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border border-emerald-400/50 border-t-emerald-300" />
                    Generating Report...
                  </>
                ) : (
                  <><ClipboardList size={13} /> Give Results</>
                )}
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>

            <div className="h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />

            {/* AI Chat — left panel */}
            <AskAIPanel />

          </GlassPanel>
        </motion.aside>

        {/* ══ CENTER: 3D Model + Results ═════════════════════ */}
        <motion.section
          variants={itemVariants}
          className="flex flex-col items-center overflow-y-auto border-r border-white/5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
        >
          {/* Score badge — above the sphere, normal flow, no overlap */}
          {breakdown && (
            <motion.div
              key={compatibilityScore}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex shrink-0 flex-col items-center gap-0.5 pt-4 pb-1"
            >
              <p className="text-[9px] tracking-[0.45em] text-white/20">▼ COMPATIBILITY ▼</p>
              <p className="text-4xl font-black tabular-nums" style={{ color: scoreColor }}>
                {compatibilityScore}
              </p>
              <p className="text-[10px] tracking-[0.3em] font-bold" style={{ color: scoreColor }}>
                {scoreLabel}
              </p>
            </motion.div>
          )}

          {/* Sphere */}
          <div className="flex w-full shrink-0 justify-center">
            <div className="h-[280px] w-[280px]">
              <BioModel compatibilityScore={compatibilityScore} />
            </div>
          </div>

          {/* Stats row — compact inline strip */}
          <div className="flex shrink-0 gap-2 px-4 pb-3">
            {[
              { label: "DB Donors", value: "24,831" },
              { label: "Match Rate", value: "98.7%" },
              { label: "Scan Time", value: "1.2s" },
            ].map((stat) => (
              <GlassPanel key={stat.label} animate={false} className="flex flex-col items-center gap-0.5 px-4 py-2">
                <span className="text-base font-bold text-cyan-300">{stat.value}</span>
                <span className="text-[9px] uppercase tracking-widest text-white/30">{stat.label}</span>
              </GlassPanel>
            ))}
          </div>

          {/* Results panel — inline, no page scroll needed */}
          <AnimatePresence>
            {(results || isGeneratingResults) && (
              <motion.div
                key="center-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="w-full px-4 pb-6"
              >
                {/* Divider */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
                  <ClipboardList size={11} className="text-emerald-400" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-400/70">
                    Clinical Report
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
                </div>
                <ResultsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ══ RIGHT: Material Selector + Radar ═════════════ */}
        <motion.aside variants={itemVariants} className="p-5 overflow-y-auto">
          <GlassPanel neonBorder animate={false} className="flex flex-col gap-5">

            <div className="flex items-center gap-2">
              <Layers size={14} className="text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Implant Analysis
              </span>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

            {/* Bone Type Selector */}
            <div className="flex flex-col gap-1.5">
              <SectionLabel icon={Activity} label="Target Bone" />
              <div className="grid grid-cols-2 gap-1.5">
                {BONE_TYPES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { setBoneType(b.id); playClick(); }}
                    onMouseEnter={playHover}
                    className={`rounded-lg border px-2 py-2 text-[10px] font-semibold transition-all ${boneType === b.id
                      ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-300"
                      : "border-white/5 bg-white/5 text-white/40 hover:border-cyan-400/30 hover:text-white/70"
                      }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Material Analyser ─────────────────────────── */}
            <div className="flex flex-col gap-3">
              <SectionLabel icon={Layers} label="Biomaterial Recommendation" />

              {/* Pre-analyse: prompt + button */}
              {!hasAnalysed && (
                <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/8">
                    <FlaskConical size={22} className="text-cyan-400" />
                  </div>
                  <p className="text-center text-[11px] leading-relaxed text-white/35">
                    Click <span className="font-bold text-cyan-400">Analyse</span> to automatically score all biomaterials and find your best implant match.
                  </p>
                  <button
                    onClick={handleAnalyse}
                    disabled={isAnalysing}
                    onMouseEnter={playHover}
                    className="group relative w-full overflow-hidden rounded-xl border border-cyan-400/50 bg-cyan-400/10 py-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-300 transition-all hover:bg-cyan-400/20 hover:shadow-lg hover:shadow-cyan-400/20 disabled:opacity-60"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isAnalysing ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border border-cyan-400/50 border-t-cyan-300" />
                          Analysing All Materials...
                        </>
                      ) : (
                        <><FlaskConical size={13} /> Analyse All Materials</>
                      )}
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </button>
                </div>
              )}

              {/* Post-analyse: best match + alternatives */}
              {hasAnalysed && allScores.length > 0 && (() => {
                const best = allScores[0];
                const rest = allScores.slice(1);
                const scoreColor = best.breakdown.overall >= 80 ? "#00f3ff" : best.breakdown.overall >= 60 ? "#f39c12" : "#e74c3c";
                return (
                  <div className="flex flex-col gap-3">

                    {/* Best Match Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 16, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="relative overflow-hidden rounded-xl border px-4 py-3.5"
                      style={{
                        borderColor: `${scoreColor}45`,
                        background: `linear-gradient(135deg, ${scoreColor}0a 0%, rgba(10,15,20,0.8) 60%)`,
                        boxShadow: `0 0 30px ${scoreColor}10 inset`,
                      }}
                    >
                      {/* Top badge */}
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: scoreColor }}>
                          <Star size={9} fill="currentColor" /> Best Match
                        </span>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                          style={{ background: `${scoreColor}18`, color: scoreColor, border: `1px solid ${scoreColor}35` }}
                        >
                          {best.breakdown.overall}/100
                        </span>
                      </div>

                      {/* Material details */}
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 shrink-0 rounded-full"
                          style={{ background: best.material.color, boxShadow: `0 0 14px ${best.material.color}80` }}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white">{best.material.label}</span>
                          <span className="text-[9px] capitalize text-white/35">{best.material.category}</span>
                        </div>
                        <div className="ml-auto flex flex-col items-end gap-0.5">
                          <span className="text-[9px] text-white/30">Elastic mod.</span>
                          <span className="text-xs font-bold text-white/60">{best.material.elasticModulus} GPa</span>
                        </div>
                      </div>

                      {/* Mini score bars */}
                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        {[
                          { label: "Biocompat.", val: best.breakdown.biocompatibility },
                          { label: "Osseointegr.", val: best.breakdown.osseointegration },
                          { label: "Stiffness", val: best.breakdown.stiffnessMatch },
                          { label: "Corrosion", val: best.breakdown.corrosionResistance },
                        ].map(({ label, val }) => {
                          const c = val >= 80 ? "#00f3ff" : val >= 60 ? "#f39c12" : "#e74c3c";
                          return (
                            <div key={label} className="flex flex-col gap-0.5">
                              <div className="flex justify-between">
                                <span className="text-[8px] text-white/30">{label}</span>
                                <span className="text-[8px] font-bold" style={{ color: c }}>{val}</span>
                              </div>
                              <div className="h-1 rounded-full bg-white/5">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ background: c }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${val}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Shimmer overlay */}
                      <div className="pointer-events-none absolute inset-0 rounded-xl" style={{ background: `linear-gradient(105deg, transparent 40%, ${scoreColor}06 60%, transparent 70%)` }} />
                    </motion.div>

                    {/* Re-analyse button */}
                    <button
                      onClick={handleAnalyse}
                      disabled={isAnalysing}
                      onMouseEnter={playHover}
                      className="w-full rounded-lg border border-white/8 bg-white/[0.03] py-2 text-[10px] font-bold uppercase tracking-widest text-white/30 transition hover:border-cyan-400/20 hover:text-cyan-400/60 disabled:opacity-50"
                    >
                      {isAnalysing ? "Analysing..." : "↻ Re-Analyse"}
                    </button>

                    {/* View Alternatives toggle */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => { setShowAlternatives((v) => !v); playClick(); }}
                        onMouseEnter={playHover}
                        className="flex w-full items-center justify-between rounded-lg border border-white/8 bg-white/[0.03] px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 transition hover:border-white/15 hover:text-white/70"
                      >
                        <span className="flex items-center gap-2">
                          <TrendingUp size={11} />
                          View Alternatives ({rest.length})
                        </span>
                        <ChevronDown
                          size={13}
                          className="transition-transform duration-300"
                          style={{ transform: showAlternatives ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </button>

                      <AnimatePresence>
                        {showAlternatives && (
                          <motion.div
                            key="alternatives"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-1.5 pt-1">
                              {rest.map((item: ScoredMaterial, idx: number) => {
                                const c = item.breakdown.overall >= 80 ? "#00f3ff" : item.breakdown.overall >= 60 ? "#f39c12" : "#e74c3c";
                                const isSelected = materialSelected === item.material.id;
                                return (
                                  <motion.button
                                    key={item.material.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.06, duration: 0.3 }}
                                    onClick={() => { setMaterial(item.material.id); playClick(); }}
                                    onMouseEnter={playHover}
                                    className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${isSelected
                                      ? "border-cyan-400/40 bg-cyan-400/10"
                                      : "border-white/5 bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04]"
                                      }`}
                                  >
                                    <div
                                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                                      style={{ background: item.material.color, boxShadow: isSelected ? `0 0 8px ${item.material.color}` : "none" }}
                                    />
                                    <div className="flex flex-col">
                                      <span className={`text-xs font-bold ${isSelected ? "text-cyan-200" : "text-white/60"}`}>
                                        {item.material.label}
                                      </span>
                                      <span className="text-[9px] capitalize text-white/25">{item.material.category}</span>
                                    </div>
                                    <div className="ml-auto flex flex-col items-end gap-0.5">
                                      <span className="text-[10px] font-black tabular-nums" style={{ color: c }}>
                                        {item.breakdown.overall}
                                      </span>
                                      <span className="text-[8px] text-white/20">score</span>
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                );
              })()}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

            {/* Radar chart + score ring */}
            <CompatibilityRadar />

          </GlassPanel>
        </motion.aside>

      </main>
    </LayoutWrapper>
  );
}
