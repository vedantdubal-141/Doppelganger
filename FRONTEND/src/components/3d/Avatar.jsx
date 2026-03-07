import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Avatar — Procedural mannequin built from primitive meshes.
 * Accepts a `measurements` prop to dynamically resize body parts.
 *
 * measurements = { height, chest, waist, hips, shoulders, armLength, legLength }
 * All values are in cm. The mannequin uses baseline proportions and scales
 * each body segment relative to the baseline.
 *
 * If a real base_avatar.glb is added later, swap this with useGLTF.
 */

/* ── Baseline measurements (average adult, cm) ── */
const BASELINE = {
    height: 175,
    chest: 96,
    waist: 82,
    hips: 96,
    shoulders: 46,
    armLength: 60,
    legLength: 80,
};

const BODY_MATERIAL = new THREE.MeshStandardMaterial({
    color: '#1a1a2e',
    metalness: 0.6,
    roughness: 0.3,
});

function Avatar({ clothingColor = '#7B61FF', measurements = {} }) {
    const groupRef = useRef();

    /* ── Compute scale factors from measurements ── */
    const scale = useMemo(() => {
        const m = { ...BASELINE, ...measurements };
        return {
            height: m.height / BASELINE.height,
            chest: m.chest / BASELINE.chest,
            waist: m.waist / BASELINE.waist,
            hips: m.hips / BASELINE.hips,
            shoulders: m.shoulders / BASELINE.shoulders,
            arm: m.armLength / BASELINE.armLength,
            leg: m.legLength / BASELINE.legLength,
        };
    }, [measurements]);

    // Subtle idle breathing animation
    useFrame((state) => {
        if (groupRef.current) {
            const baseY = -1.2 * scale.height;
            groupRef.current.position.y =
                baseY + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
        }
    });

    const clothingMat = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: clothingColor,
                metalness: 0.4,
                roughness: 0.35,
                transparent: true,
                opacity: 0.92,
            }),
        [clothingColor]
    );

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

    const headY = 1.85 * scale.height;
    const neckY = 1.58 * scale.height;
    const shoeY = -0.18 * scale.height;

    return (
        <group ref={groupRef} position={[0, -1.2 * scale.height, 0]}>
            {/* ── Head ── */}
            <mesh position={[0, headY, 0]} material={BODY_MATERIAL}>
                <sphereGeometry args={[0.22, 32, 32]} />
            </mesh>

            {/* ── Neck ── */}
            <mesh position={[0, neckY, 0]} material={BODY_MATERIAL}>
                <cylinderGeometry args={[0.08, 0.1, 0.12, 16]} />
            </mesh>

            {/* ── Torso (clothing) ── */}
            <mesh position={[0, torsoY, 0]} material={clothingMat}>
                <cylinderGeometry args={[torsoRadiusTop, torsoRadiusBot, torsoHeight, 16]} />
            </mesh>

            {/* ── Hips ── */}
            <mesh position={[0, hipY, 0]} material={clothingMat}>
                <cylinderGeometry args={[hipRadiusTop, hipRadiusBot, 0.18, 16]} />
            </mesh>

            {/* ── Left arm ── */}
            <mesh
                position={[-shoulderOffset, armY, 0]}
                rotation={[0, 0, 0.15]}
                material={clothingMat}
            >
                <cylinderGeometry args={[0.06, 0.07, armHeight, 12]} />
            </mesh>
            {/* Left forearm */}
            <mesh
                position={[-(shoulderOffset + 0.04), forearmY, 0]}
                rotation={[0, 0, 0.08]}
                material={BODY_MATERIAL}
            >
                <cylinderGeometry args={[0.05, 0.06, forearmHeight, 12]} />
            </mesh>

            {/* ── Right arm ── */}
            <mesh
                position={[shoulderOffset, armY, 0]}
                rotation={[0, 0, -0.15]}
                material={clothingMat}
            >
                <cylinderGeometry args={[0.06, 0.07, armHeight, 12]} />
            </mesh>
            {/* Right forearm */}
            <mesh
                position={[shoulderOffset + 0.04, forearmY, 0]}
                rotation={[0, 0, -0.08]}
                material={BODY_MATERIAL}
            >
                <cylinderGeometry args={[0.05, 0.06, forearmHeight, 12]} />
            </mesh>

            {/* ── Left leg ── */}
            <mesh position={[-legSpacing, upperLegY, 0]} material={clothingMat}>
                <cylinderGeometry args={[0.09 * scale.hips, 0.08, upperLegH, 12]} />
            </mesh>
            <mesh position={[-legSpacing, lowerLegY, 0]} material={BODY_MATERIAL}>
                <cylinderGeometry args={[0.07, 0.06, lowerLegH, 12]} />
            </mesh>

            {/* ── Right leg ── */}
            <mesh position={[legSpacing, upperLegY, 0]} material={clothingMat}>
                <cylinderGeometry args={[0.09 * scale.hips, 0.08, upperLegH, 12]} />
            </mesh>
            <mesh position={[legSpacing, lowerLegY, 0]} material={BODY_MATERIAL}>
                <cylinderGeometry args={[0.07, 0.06, lowerLegH, 12]} />
            </mesh>

            {/* ── Shoes ── */}
            <mesh position={[-legSpacing, shoeY, 0.04]} material={BODY_MATERIAL}>
                <boxGeometry args={[0.12, 0.06, 0.18]} />
            </mesh>
            <mesh position={[legSpacing, shoeY, 0.04]} material={BODY_MATERIAL}>
                <boxGeometry args={[0.12, 0.06, 0.18]} />
            </mesh>
        </group>
    );
}

export default Avatar;
