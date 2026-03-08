import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Avatar — Procedural mannequin built from primitive meshes.
 *
 * This component renders ONLY the body (skin-tone).
 * Clothing is handled entirely by ClothingMesh, which overlays
 * on top. This separation ensures the avatar stays stable and
 * only the clothing shell changes when the user selects products.
 *
 * Accepts biometric measurements from AuthContext:
 *   { height (cm), weight (kg), shoulderWidth (cm), waist (cm) }
 *
 * Derives chest, hips, armLength, legLength using anthropometric ratios.
 */

/* ── Baseline measurements (average adult, cm) ── */
const BASELINE = {
    height: 175,
    weight: 70,
    chest: 96,
    waist: 82,
    hips: 96,
    shoulders: 46,
    armLength: 60,
    legLength: 80,
};

/**
 * Derive full body measurements from the 4 biometric inputs.
 */
export function deriveMeasurements({ height = 175, weight = 70, shoulderWidth = 46, waist = 82 }) {
    const h = Number(height) || 175;
    const w = Number(weight) || 70;
    const sw = Number(shoulderWidth) || 46;
    const wa = Number(waist) || 82;

    const bmi = w / ((h / 100) ** 2);
    const bmiFactor = Math.max(0.8, Math.min(1.4, bmi / 22));

    return {
        height: h,
        chest: wa * 1.15 * bmiFactor,
        waist: wa,
        hips: wa * 1.08 * bmiFactor,
        shoulders: sw,
        armLength: h * 0.34,
        legLength: h * 0.46,
    };
}

export function computeScale(derived) {
    return {
        height: derived.height / BASELINE.height,
        chest: derived.chest / BASELINE.chest,
        waist: derived.waist / BASELINE.waist,
        hips: derived.hips / BASELINE.hips,
        shoulders: derived.shoulders / BASELINE.shoulders,
        arm: derived.armLength / BASELINE.armLength,
        leg: derived.legLength / BASELINE.legLength,
    };
}

/* ── Materials ── */
const SKIN_MATERIAL = new THREE.MeshStandardMaterial({
    color: '#c4956a',
    metalness: 0.05,
    roughness: 0.65,
});

const HAIR_MATERIAL = new THREE.MeshStandardMaterial({
    color: '#1a1a2e',
    metalness: 0.3,
    roughness: 0.5,
});

const SHOE_MATERIAL = new THREE.MeshStandardMaterial({
    color: '#111111',
    metalness: 0.4,
    roughness: 0.4,
});

const EYE_MATERIAL = new THREE.MeshStandardMaterial({ color: '#222222' });

function Avatar({ measurements = {} }) {
    const groupRef = useRef();

    const derived = useMemo(() => deriveMeasurements(measurements), [measurements]);
    const scale = useMemo(() => computeScale(derived), [derived]);

    // Subtle idle breathing animation
    useFrame((state) => {
        if (groupRef.current) {
            const baseY = -1.2 * scale.height;
            groupRef.current.position.y =
                baseY + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
        }
    });

    /* ── Derived dimensions ── */
    const torsoRadiusTop = 0.28 * scale.chest;
    const torsoRadiusBot = 0.22 * scale.waist;
    const torsoHeight = 0.75 * scale.height;
    const torsoY = 1.15 * scale.height;

    const hipRadiusTop = 0.22 * scale.waist;
    const hipRadiusBot = 0.26 * scale.hips;
    const hipY = 0.7 * scale.height;

    const shoulderOffset = 0.38 * scale.shoulders;
    const armHeight = 0.6 * scale.arm;
    const forearmHeight = 0.4 * scale.arm;
    const armY = 1.2 * scale.height;
    const forearmY = 0.82 * scale.height;

    const legSpacing = 0.12 * scale.hips;
    const upperLegH = 0.55 * scale.leg;
    const lowerLegH = 0.25 * scale.leg;
    const upperLegY = 0.35 * scale.height;
    const lowerLegY = -0.02 * scale.height;

    const headRadius = 0.22;
    const headY = 1.85 * scale.height;
    const neckY = 1.58 * scale.height;
    const shoeY = -0.18 * scale.height;

    return (
        <group ref={groupRef} position={[0, -1.2 * scale.height, 0]}>
            {/* ── Head ── */}
            <mesh position={[0, headY, 0]} material={SKIN_MATERIAL} castShadow>
                <sphereGeometry args={[headRadius, 32, 32]} />
            </mesh>

            {/* ── Hair cap ── */}
            <mesh position={[0, headY + 0.06, -0.02]} material={HAIR_MATERIAL}>
                <sphereGeometry args={[headRadius * 1.02, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>

            {/* ── Eyes ── */}
            <mesh position={[-0.07, headY + 0.02, 0.18]} material={EYE_MATERIAL}>
                <sphereGeometry args={[0.025, 16, 16]} />
            </mesh>
            <mesh position={[0.07, headY + 0.02, 0.18]} material={EYE_MATERIAL}>
                <sphereGeometry args={[0.025, 16, 16]} />
            </mesh>

            {/* ── Neck ── */}
            <mesh position={[0, neckY, 0]} material={SKIN_MATERIAL} castShadow>
                <cylinderGeometry args={[0.08, 0.1, 0.15, 16]} />
            </mesh>

            {/* ── Torso (SKIN underneath clothing) ── */}
            <mesh position={[0, torsoY, 0]} material={SKIN_MATERIAL} castShadow>
                <cylinderGeometry args={[torsoRadiusTop - 0.01, torsoRadiusBot - 0.01, torsoHeight - 0.01, 20]} />
            </mesh>

            {/* ── Hips (SKIN underneath clothing) ── */}
            <mesh position={[0, hipY, 0]} material={SKIN_MATERIAL} castShadow>
                <cylinderGeometry args={[hipRadiusTop - 0.01, hipRadiusBot - 0.01, 0.18, 20]} />
            </mesh>

            {/* ── Left upper arm (SKIN underneath) ── */}
            <mesh
                position={[-shoulderOffset, armY, 0]}
                rotation={[0, 0, 0.15]}
                material={SKIN_MATERIAL}
                castShadow
            >
                <cylinderGeometry args={[0.058, 0.063, armHeight - 0.01, 14]} />
            </mesh>
            {/* Left forearm (always exposed skin) */}
            <mesh
                position={[-(shoulderOffset + 0.04), forearmY, 0]}
                rotation={[0, 0, 0.08]}
                material={SKIN_MATERIAL}
                castShadow
            >
                <cylinderGeometry args={[0.05, 0.055, forearmHeight, 14]} />
            </mesh>
            {/* Left hand */}
            <mesh
                position={[-(shoulderOffset + 0.06), forearmY - forearmHeight / 2 - 0.04, 0]}
                material={SKIN_MATERIAL}
            >
                <sphereGeometry args={[0.045, 12, 12]} />
            </mesh>

            {/* ── Right upper arm (SKIN underneath) ── */}
            <mesh
                position={[shoulderOffset, armY, 0]}
                rotation={[0, 0, -0.15]}
                material={SKIN_MATERIAL}
                castShadow
            >
                <cylinderGeometry args={[0.058, 0.063, armHeight - 0.01, 14]} />
            </mesh>
            {/* Right forearm (always exposed skin) */}
            <mesh
                position={[shoulderOffset + 0.04, forearmY, 0]}
                rotation={[0, 0, -0.08]}
                material={SKIN_MATERIAL}
                castShadow
            >
                <cylinderGeometry args={[0.05, 0.055, forearmHeight, 14]} />
            </mesh>
            {/* Right hand */}
            <mesh
                position={[shoulderOffset + 0.06, forearmY - forearmHeight / 2 - 0.04, 0]}
                material={SKIN_MATERIAL}
            >
                <sphereGeometry args={[0.045, 12, 12]} />
            </mesh>

            {/* ── Left leg (SKIN underneath) ── */}
            <mesh position={[-legSpacing, upperLegY, 0]} material={SKIN_MATERIAL} castShadow>
                <cylinderGeometry args={[0.085 * scale.hips, 0.068, upperLegH - 0.01, 14]} />
            </mesh>
            <mesh position={[-legSpacing, lowerLegY, 0]} material={SKIN_MATERIAL} castShadow>
                <cylinderGeometry args={[0.065, 0.055, lowerLegH, 14]} />
            </mesh>

            {/* ── Right leg (SKIN underneath) ── */}
            <mesh position={[legSpacing, upperLegY, 0]} material={SKIN_MATERIAL} castShadow>
                <cylinderGeometry args={[0.085 * scale.hips, 0.068, upperLegH - 0.01, 14]} />
            </mesh>
            <mesh position={[legSpacing, lowerLegY, 0]} material={SKIN_MATERIAL} castShadow>
                <cylinderGeometry args={[0.065, 0.055, lowerLegH, 14]} />
            </mesh>

            {/* ── Shoes ── */}
            <mesh position={[-legSpacing, shoeY, 0.04]} material={SHOE_MATERIAL} castShadow>
                <boxGeometry args={[0.13, 0.07, 0.2]} />
            </mesh>
            <mesh position={[legSpacing, shoeY, 0.04]} material={SHOE_MATERIAL} castShadow>
                <boxGeometry args={[0.13, 0.07, 0.2]} />
            </mesh>
        </group>
    );
}

export default Avatar;
