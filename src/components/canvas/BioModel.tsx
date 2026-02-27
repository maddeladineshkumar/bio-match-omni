"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface BioModelProps {
    compatibilityScore?: number; // 0–100, higher = faster spin
}

// Maps compatibility score to a speed multiplier (1× at 0%, 3× at 100%)
function scoreToSpeed(score: number) {
    return 1 + (score / 100) * 2;
}

function TechCore({ speed }: { speed: number }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        const scrollBoost = scrollY * 0.001;
        meshRef.current.rotation.x = t * 0.2 * speed + scrollBoost;
        meshRef.current.rotation.y = t * 0.35 * speed + scrollBoost;
        meshRef.current.position.y = Math.sin(t * 0.7) * 0.18;
    });

    return (
        <mesh ref={meshRef}>
            <icosahedronGeometry args={[1.8, 1]} />
            <meshStandardMaterial
                color="#00f3ff"
                emissive="#00f3ff"
                emissiveIntensity={0.3 + speed * 0.15}
                wireframe
                transparent
                opacity={0.85}
            />
        </mesh>
    );
}

function InnerCore({ speed }: { speed: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.x = -t * 0.5 * speed;
        meshRef.current.rotation.z = t * 0.3 * speed;
        meshRef.current.position.y = Math.sin(t * 0.7) * 0.18;
    });

    return (
        <mesh ref={meshRef}>
            <icosahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial
                color="#00f3ff"
                emissive="#00a8b5"
                emissiveIntensity={0.8 + speed * 0.3}
                wireframe
                transparent
                opacity={0.5}
            />
        </mesh>
    );
}

function OuterRing({ speed }: { speed: number }) {
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!ringRef.current) return;
        const t = state.clock.getElapsedTime();
        ringRef.current.rotation.z = t * 0.15 * speed;
        ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.4) * 0.2;
        ringRef.current.position.y = Math.sin(t * 0.7) * 0.18;
    });

    return (
        <mesh ref={ringRef}>
            <torusGeometry args={[2.5, 0.012, 8, 120]} />
            <meshStandardMaterial
                color="#00f3ff"
                emissive="#00f3ff"
                emissiveIntensity={0.5 + speed * 0.2}
                transparent
                opacity={0.6}
            />
        </mesh>
    );
}

export default function BioModel({ compatibilityScore = 0 }: BioModelProps) {
    const speed = scoreToSpeed(compatibilityScore);

    return (
        <div className="h-full w-full">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: "transparent" }}
            >
                <ambientLight intensity={0.2} />
                <pointLight position={[5, 5, 5]} intensity={2} color="#00f3ff" />
                <pointLight position={[-5, -5, -3]} intensity={0.5} color="#0055ff" />

                <TechCore speed={speed} />
                <InnerCore speed={speed} />
                <OuterRing speed={speed} />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.4 * speed}
                    enableDamping
                    dampingFactor={0.05}
                />
            </Canvas>
        </div>
    );
}
