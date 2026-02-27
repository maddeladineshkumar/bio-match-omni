"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface LayoutWrapperProps {
    children: React.ReactNode;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

export const itemVariants = {
    hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.7,
            ease: "easeOut" as const,
        },
    },
};

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            setSpotlightPos({ x, y });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative min-h-screen w-full overflow-hidden"
            style={{
                background: `
          radial-gradient(
            ellipse 60% 60% at ${spotlightPos.x}% ${spotlightPos.y}%,
            rgba(0, 243, 255, 0.055) 0%,
            rgba(3, 5, 8, 0) 70%
          ),
          radial-gradient(ellipse 80% 80% at 50% 0%, rgba(0, 80, 120, 0.2) 0%, transparent 70%),
          #030508
        `,
                transition: "background 0.1s ease-out",
            }}
        >
            {/* Grid overlay */}
            <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(0,243,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,243,255,0.025) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Noise texture overlay */}
            <div
                className="pointer-events-none absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: "150px",
                }}
            />

            {/* Main staggered content */}
            <motion.div
                className="relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {children}
            </motion.div>
        </div>
    );
}
