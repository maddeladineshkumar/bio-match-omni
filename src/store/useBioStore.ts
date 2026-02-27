// useBioStore.ts — The Central Brain of BIO-MATCH OMNI
import { create } from "zustand";

// ─── Material Database ──────────────────────────────────────────────────────
// Properties: elasticModulus (GPa), yieldStrength (MPa), biocompatibility (0-1),
//             osseointegration (0-1), corrosionResistance (0-1), density (g/cm³)
export interface BiomaterialProfile {
    id: string;
    label: string;
    category: "metal" | "ceramic" | "polymer" | "composite";
    elasticModulus: number;  // GPa
    yieldStrength: number;   // MPa
    biocompatibility: number; // 0–1
    osseointegration: number; // 0–1
    corrosionResistance: number; // 0–1
    density: number;         // g/cm³
    color: string;
}

export const MATERIALS: BiomaterialProfile[] = [
    {
        id: "ti6al4v", label: "Ti-6Al-4V", category: "metal",
        elasticModulus: 114, yieldStrength: 880, biocompatibility: 0.92,
        osseointegration: 0.88, corrosionResistance: 0.95, density: 4.43,
        color: "#4a90d9",
    },
    {
        id: "coCrMo", label: "Co-Cr-Mo", category: "metal",
        elasticModulus: 220, yieldStrength: 500, biocompatibility: 0.80,
        osseointegration: 0.72, corrosionResistance: 0.88, density: 8.3,
        color: "#9b59b6",
    },
    {
        id: "stainless316L", label: "316L Steel", category: "metal",
        elasticModulus: 200, yieldStrength: 310, biocompatibility: 0.72,
        osseointegration: 0.61, corrosionResistance: 0.78, density: 7.9,
        color: "#95a5a6",
    },
    {
        id: "hydroxyapatite", label: "Hydroxyapatite", category: "ceramic",
        elasticModulus: 80, yieldStrength: 120, biocompatibility: 0.98,
        osseointegration: 0.97, corrosionResistance: 1.0, density: 3.16,
        color: "#f39c12",
    },
    {
        id: "peek", label: "PEEK", category: "polymer",
        elasticModulus: 3.6, yieldStrength: 100, biocompatibility: 0.90,
        osseointegration: 0.65, corrosionResistance: 0.99, density: 1.32,
        color: "#27ae60",
    },
    {
        id: "cfrp", label: "CF/PEEK Composite", category: "composite",
        elasticModulus: 18, yieldStrength: 200, biocompatibility: 0.88,
        osseointegration: 0.70, corrosionResistance: 0.97, density: 1.55,
        color: "#e74c3c",
    },
];

// ─── Bone Type Database ─────────────────────────────────────────────────────
export interface BoneProfile {
    id: string;
    label: string;
    naturalModulus: number; // GPa — cortical ≈14–25, cancellous ≈0.1–5
    targetYieldStrength: number; // MPa
    vascularityFactor: number; // 0–1, affects healing/osseointegration
}

export const BONE_TYPES: BoneProfile[] = [
    { id: "femur", label: "Femur", naturalModulus: 17, targetYieldStrength: 160, vascularityFactor: 0.85 },
    { id: "tibia", label: "Tibia", naturalModulus: 18, targetYieldStrength: 170, vascularityFactor: 0.80 },
    { id: "humerus", label: "Humerus", naturalModulus: 15, targetYieldStrength: 130, vascularityFactor: 0.78 },
    { id: "vertebra", label: "Vertebra", naturalModulus: 12, targetYieldStrength: 100, vascularityFactor: 0.60 },
    { id: "radius", label: "Radius", naturalModulus: 14, targetYieldStrength: 140, vascularityFactor: 0.75 },
    { id: "mandible", label: "Mandible", naturalModulus: 20, targetYieldStrength: 190, vascularityFactor: 0.90 },
];

// ─── Radar Axis Definitions ─────────────────────────────────────────────────
export interface RadarAxis {
    key: string;
    label: string;
    value: number; // 0–100
}

// ─── Compatibility Score Breakdown ──────────────────────────────────────────
export interface CompatibilityBreakdown {
    overall: number;       // 0–100
    stiffnessMatch: number;
    biocompatibility: number;
    osseointegration: number;
    corrosionResistance: number;
    weightLoad: number;
    radarAxes: RadarAxis[];
}

// ─── Scored Material ────────────────────────────────────────────────────────
export interface ScoredMaterial {
    material: BiomaterialProfile;
    breakdown: CompatibilityBreakdown;
}

// ─── Results Report ──────────────────────────────────────────────────────────
export interface ResultsReport {
    perfectMatch: {
        materialLabel: string;
        materialCategory: string;
        materialColor: string;
        overallScore: number;
        rankLabel: string;
        topStats: { label: string; value: number }[];
    };
    patientNote: string;
    doctorQuestions: string[];
}

// ─── Report Generator ────────────────────────────────────────────────────────
function buildReport(
    material: BiomaterialProfile,
    bone: BoneProfile,
    breakdown: CompatibilityBreakdown,
    patient: { name: string; age: string; bloodGroup: string; urgency: string },
    weight: number
): ResultsReport {
    const score = breakdown.overall;
    const rankLabel =
        score >= 80 ? "OPTIMAL MATCH" :
            score >= 60 ? "GOOD CANDIDATE" :
                score >= 40 ? "MARGINAL FIT" :
                    "NOT RECOMMENDED";

    // ── Patient Note prose ──────────────────────────────────────────────────
    const stiffnessTip =
        breakdown.stiffnessMatch >= 70
            ? `Its elastic modulus of ${material.elasticModulus} GPa closely mirrors the natural stiffness of the ${bone.label} (≈${bone.naturalModulus} GPa), minimising stress-shielding and promoting long-term bone remodelling.`
            : `There is a notable stiffness mismatch between ${material.label} (${material.elasticModulus} GPa) and the ${bone.label} (≈${bone.naturalModulus} GPa). Monitoring for stress-shielding and scheduling periodic bone-density checks is strongly recommended.`;

    const osseoTip =
        breakdown.osseointegration >= 80
            ? `Its osseointegration rating of ${breakdown.osseointegration}/100 indicates exceptional ability to bond with surrounding bone tissue — typically resulting in faster, more stable healing.`
            : `Osseointegration scores are moderate (${breakdown.osseointegration}/100). Surface treatments or adjunctive biologics (e.g., bone morphogenetic protein) may be considered to promote implant-bone bonding.`;

    const weightNote =
        weight >= 100
            ? `Given the patient's weight (${weight} kg), mechanical load demands are elevated. The ${material.label}'s yield strength of ${material.yieldStrength} MPa provides adequate structural reserve, but activity restriction during initial healing is advised.`
            : `The ${material.label}'s yield strength (${material.yieldStrength} MPa) is well-suited to the mechanical demands imposed by the patient's weight (${weight} kg).`;

    const urgencyNote =
        patient.urgency === "critical" || patient.urgency === "high"
            ? `Given the ${patient.urgency} urgency classification, expedited surgical planning is warranted.`
            : `The ${patient.urgency} urgency level allows time for thorough pre-operative planning and patient optimisation.`;

    const patientName = patient.name ? `For ${patient.name}, ` : "Based on the entered parameters, ";
    const ageNote = patient.age ? ` The patient's age (${patient.age} yrs) should be factored into rehabilitation timelines.` : "";

    const patientNote = [
        `${patientName}analysis indicates that **${material.label}** (${material.category}) is the ${rankLabel.toLowerCase()} for the ${bone.label} implant site, achieving an overall compatibility score of **${score}/100**.`,
        stiffnessTip,
        osseoTip,
        weightNote,
        urgencyNote + ageNote,
        `The material's biocompatibility index stands at ${breakdown.biocompatibility}/100 and its corrosion resistance at ${breakdown.corrosionResistance}/100 — both reflecting its suitability for long-term in-vivo deployment.`,
    ].join(" ");

    // ── Doctor Questions ────────────────────────────────────────────────────
    const questions: string[] = [
        `Given my profile, is ${material.label} the most appropriate biomaterial for my ${bone.label} implant, or are there newer alternatives worth considering?`,
        `What does a compatibility score of ${score}/100 mean for my expected recovery timeline and long-term implant durability?`,
    ];

    if (breakdown.stiffnessMatch < 70) {
        questions.push(
            `The stiffness mismatch between ${material.label} and my ${bone.label} was flagged — how will stress-shielding be monitored or mitigated post-surgery?`
        );
    } else {
        questions.push(
            `What imaging protocol (X-ray / CT / DEXA) will you use to confirm successful osseointegration and rule out stress-shielding over the first two years?`
        );
    }

    questions.push(
        `Are there activity restrictions or physiotherapy milestones I should be aware of given the ${bone.label} implant location and my weight (${weight} kg)?`
    );

    if (patient.urgency === "critical" || patient.urgency === "high") {
        questions.push(
            `What is the earliest feasible surgery date, and what pre-operative optimisation steps (e.g., infection screening, nutrition) must be completed first?`
        );
    } else {
        questions.push(
            `Are there any lifestyle modifications (weight management, vitamin D / calcium supplementation) that could improve implant outcomes before the procedure?`
        );
    }

    return {
        perfectMatch: {
            materialLabel: material.label,
            materialCategory: material.category,
            materialColor: material.color,
            overallScore: score,
            rankLabel,
            topStats: [
                { label: "Biocompat.", value: breakdown.biocompatibility },
                { label: "Osseointegration", value: breakdown.osseointegration },
                { label: "Stiffness Match", value: breakdown.stiffnessMatch },
                { label: "Corrosion Resist.", value: breakdown.corrosionResistance },
            ],
        },
        patientNote,
        doctorQuestions: questions,
    };
}

// ─── Core Algorithm ─────────────────────────────────────────────────────────
function calculateScore(
    material: BiomaterialProfile,
    bone: BoneProfile,
    patientWeight: number
): CompatibilityBreakdown {
    // 1. Stiffness mismatch penalty — ideal = bone's natural modulus
    //    Too stiff → stress shielding, too flexible → micro-motion failure
    const modulusRatio = material.elasticModulus / bone.naturalModulus;
    const stiffnessMismatch = Math.abs(Math.log(modulusRatio)); // 0 = perfect
    const stiffnessScore = Math.max(0, 100 - stiffnessMismatch * 35);

    // 2. Yield Strength vs. mechanical demand
    //    Load estimate: 3× body-weight (gait cycle peak) in Newtons / bone area proxy
    const bodyWeightN = patientWeight * 9.81;
    const loadDemand = bodyWeightN * 3;                    // peak load N
    const boneAreaProxy = bone.targetYieldStrength * 0.8;  // mm² proxy
    const requiredStrength = loadDemand / (boneAreaProxy * 100); // MPa rough
    const strengthRatio = material.yieldStrength / Math.max(requiredStrength, 1);
    const weightLoadScore = Math.min(100, Math.log10(strengthRatio + 1) * 80);

    // 3. Biocompatibility — scaled and vascularity-modulated
    const bioScore = material.biocompatibility * bone.vascularityFactor * 100;

    // 4. Osseointegration — ceramic/HA dramatically better
    const osseoScore = material.osseointegration * 100;

    // 5. Corrosion resistance — in-vivo environment
    const corrScore = material.corrosionResistance * 100;

    // Weighted composite
    const overall = Math.round(
        stiffnessScore * 0.30 +
        bioScore * 0.25 +
        osseoScore * 0.25 +
        weightLoadScore * 0.12 +
        corrScore * 0.08
    );

    const radarAxes: RadarAxis[] = [
        { key: "stiffnessMatch", label: "Stiffness Match", value: Math.round(stiffnessScore) },
        { key: "biocompatibility", label: "Biocompatibility", value: Math.round(bioScore) },
        { key: "osseointegration", label: "Osseointegration", value: Math.round(osseoScore) },
        { key: "corrosionResist", label: "Corrosion Resist.", value: Math.round(corrScore) },
        { key: "weightLoad", label: "Weight Load", value: Math.round(weightLoadScore) },
    ];

    return {
        overall: Math.min(100, Math.max(0, overall)),
        stiffnessMatch: Math.round(stiffnessScore),
        biocompatibility: Math.round(bioScore),
        osseointegration: Math.round(osseoScore),
        corrosionResistance: Math.round(corrScore),
        weightLoad: Math.round(weightLoadScore),
        radarAxes,
    };
}

// ─── Zustand Store ──────────────────────────────────────────────────────────
interface PatientData {
    name: string;
    age: string;
    bloodGroup: string;
    tissueType: string;
    urgency: "critical" | "high" | "moderate" | "low";
}

interface BioState {
    // Patient
    patient: PatientData;
    setPatient: (data: Partial<PatientData>) => void;

    // Implant parameters
    boneType: string;
    setBoneType: (id: string) => void;

    weight: number;
    setWeight: (w: number) => void;

    materialSelected: string;
    setMaterial: (id: string) => void;

    // Engine output
    compatibilityScore: number;
    breakdown: CompatibilityBreakdown | null;
    calculateCompatibility: () => void;

    // Analysis — all materials ranked
    hasAnalysed: boolean;
    allScores: ScoredMaterial[];
    runAnalysis: () => void;

    // Results
    results: ResultsReport | null;
    isGeneratingResults: boolean;
    generateResults: () => void;

    // UI states
    isScanning: boolean;
    setIsScanning: (v: boolean) => void;
}

export const useBioStore = create<BioState>((set, get) => ({
    patient: {
        name: "", age: "", bloodGroup: "", tissueType: "", urgency: "moderate",
    },
    setPatient: (data) =>
        set((s) => ({ patient: { ...s.patient, ...data } })),

    boneType: "femur",
    setBoneType: (id) => {
        set({ boneType: id });
        get().calculateCompatibility();
    },

    weight: 70,
    setWeight: (w) => {
        set({ weight: w });
        get().calculateCompatibility();
    },

    materialSelected: "ti6al4v",
    setMaterial: (id) => {
        set({ materialSelected: id });
        get().calculateCompatibility();
    },

    compatibilityScore: 0,
    breakdown: null,

    calculateCompatibility: () => {
        const { boneType, weight, materialSelected } = get();
        const material = MATERIALS.find((m) => m.id === materialSelected);
        const bone = BONE_TYPES.find((b) => b.id === boneType);
        if (!material || !bone) return;
        const result = calculateScore(material, bone, weight);
        set({ compatibilityScore: result.overall, breakdown: result });
    },

    // Analysis — all materials ranked
    hasAnalysed: false,
    allScores: [],
    runAnalysis: () => {
        const { boneType, weight } = get();
        const bone = BONE_TYPES.find((b) => b.id === boneType);
        if (!bone) return;

        const scored: ScoredMaterial[] = MATERIALS.map((mat) => ({
            material: mat,
            breakdown: calculateScore(mat, bone, weight),
        })).sort((a, b) => b.breakdown.overall - a.breakdown.overall);

        const best = scored[0].material;
        set({ allScores: scored, hasAnalysed: true, materialSelected: best.id });
        get().calculateCompatibility();
    },

    // Results
    results: null,
    isGeneratingResults: false,
    generateResults: () => {
        const { boneType, weight, materialSelected, breakdown, patient } = get();
        const material = MATERIALS.find((m) => m.id === materialSelected);
        const bone = BONE_TYPES.find((b) => b.id === boneType);
        if (!material || !bone || !breakdown) return;
        set({ isGeneratingResults: true, results: null });
        // Simulate a brief async generation for UX feel
        setTimeout(() => {
            const report = buildReport(material, bone, breakdown, patient, weight);
            set({ results: report, isGeneratingResults: false });
        }, 1400);
    },

    isScanning: false,
    setIsScanning: (v) => set({ isScanning: v }),
}));
