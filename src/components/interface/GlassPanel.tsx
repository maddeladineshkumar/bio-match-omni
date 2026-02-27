"use client";

import { motion, MotionProps } from "framer-motion";
import { itemVariants } from "./LayoutWrapper";
import { clsx } from "clsx";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    animate?: boolean;
    neonBorder?: boolean;
    motionProps?: MotionProps;
}

export default function GlassPanel({
    children,
    className,
    animate = true,
    neonBorder = false,
    motionProps,
    ...rest
}: GlassPanelProps) {
    const style: React.CSSProperties = {
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "rgba(10, 15, 20, 0.70)",
        border: neonBorder
            ? "1px solid rgba(0, 243, 255, 0.25)"
            : "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: neonBorder
            ? "0 0 40px rgba(0,0,0,0.5), 0 0 24px rgba(0,243,255,0.07) inset"
            : "0 0 40px rgba(0,0,0,0.5)",
    };

    if (animate) {
        return (
            <motion.div
                variants={itemVariants}
                className={clsx("rounded-2xl p-6", className)}
                style={style}
                {...motionProps}
                {...(rest as MotionProps)}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div className={clsx("rounded-2xl p-6", className)} style={style} {...rest}>
            {children}
        </div>
    );
}
