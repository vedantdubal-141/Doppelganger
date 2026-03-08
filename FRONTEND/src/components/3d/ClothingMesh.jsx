import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { deriveMeasurements, computeScale } from './Avatar';

/**
 * ClothingMesh — Dynamic clothing overlay that wraps the Avatar body.
 *
 * This is the ONLY component that changes when the user selects a
 * different product. The Avatar underneath stays exactly the same.
 *
 * Features:
 * - Style-specific clothing configurations (jacket/pants/sleeves/looseness)
 * - Smooth color interpolation when switching products via useFrame lerp
 * - Body-wrapping shell geometry slightly larger than Avatar body
 *
 * Props:
 *   style        — product style string (e.g. "streetwear", "formal")
 *   color        — the accent color for this product
 *   measurements — user biometric data { height, weight, shoulderWidth, waist }
 *   visible      — whether to render
 */

/**
 * STYLE_CONFIG defines which body parts get clothing overlays
 * and how much they extend beyond the base mesh.
 */
const STYLE_CONFIG = {
    streetwear: { jacket: true, pants: true, longSleeves: true, pantsLength: 'full', jacketLoose: 0.04, label: 'Streetwear Fit' },
    casual: { jacket: true, pants: true, longSleeves: false, pantsLength: 'full', jacketLoose: 0.025, label: 'Casual Fit' },
    formal: { jacket: true, pants: true, longSleeves: true, pantsLength: 'full', jacketLoose: 0.03, label: 'Formal Fit' },
    sportswear: { jacket: true, pants: true, longSleeves: false, pantsLength: 'short', jacketLoose: 0.02, label: 'Sports Fit' },
    vintage: { jacket: true, pants: true, longSleeves: true, pantsLength: 'full', jacketLoose: 0.035, label: 'Vintage Fit' },
    summer: { jacket: true, pants: true, longSleeves: false, pantsLength: 'short', jacketLoose: 0.02, label: 'Summer Fit' },
    default: { jacket: true, pants: true, longSleeves: false, pantsLength: 'full', jacketLoose: 0.025, label: 'Standard Fit' },
};

function ClothingMesh({ style = 'default', color = '#00F0FF', measurements = {}, visible = true }) {
    const config = STYLE_CONFIG[style] || STYLE_CONFIG.default;
    const derived = useMemo(() => deriveMeasurements(measurements), [measurements]);
    const scale = useMemo(() => computeScale(derived), [derived]);

    const groupRef = useRef();
    const targetColor = useRef(new THREE.Color(color));
    const currentColor = useRef(new THREE.Color(color));

    // Update target color when prop changes
    useMemo(() => {
        targetColor.current.set(color);
    }, [color]);

    const material = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: color,
                metalness: 0.25,
                roughness: 0.4,
                clearcoat: 0.6,
                clearcoatRoughness: 0.15,
                transparent: true,
                opacity: 0.92,
            }),
        [] // intentionally empty — we animate color via useFrame
    );

    const accentMat = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: color,
                metalness: 0.5,
                roughness: 0.25,
                transparent: true,
                opacity: 0.5,
                emissive: color,
                emissiveIntensity: 0.12,
            }),
        []
    );

    // Smooth color transition via lerp each frame
    useFrame(() => {
        currentColor.current.lerp(targetColor.current, 0.08);
        material.color.copy(currentColor.current);
        material.needsUpdate = true;
        accentMat.color.copy(currentColor.current);
        accentMat.emissive.copy(currentColor.current);
        accentMat.needsUpdate = true;
    });

    if (!visible) return null;

    const loose = config.jacketLoose;

    /* ── Dimensions matching Avatar body (slightly larger for clothing shell) ── */
    const torsoRadiusTop = 0.28 * scale.chest + loose;
    const torsoRadiusBot = 0.22 * scale.waist + loose;
    const torsoHeight = 0.75 * scale.height + 0.02;
    const torsoY = 1.15 * scale.height;

    const hipRadiusTop = 0.22 * scale.waist + loose;
    const hipRadiusBot = 0.26 * scale.hips + loose;
    const hipY = 0.7 * scale.height;

    const shoulderOffset = 0.38 * scale.shoulders;
    const armHeight = 0.6 * scale.arm;
    const legSpacing = 0.12 * scale.hips;
    const upperLegH = config.pantsLength === 'short' ? 0.35 * scale.leg : 0.55 * scale.leg;
    const upperLegY = config.pantsLength === 'short'
        ? 0.35 * scale.height + (0.55 - 0.35) * scale.leg * 0.5
        : 0.35 * scale.height;
    const armY = 1.2 * scale.height;

    return (
        <group ref={groupRef}>
            {/* ── Jacket / Torso shell ── */}
            {config.jacket && (
                <>
                    <mesh position={[0, torsoY, 0]} material={material} castShadow>
                        <cylinderGeometry args={[torsoRadiusTop, torsoRadiusBot, torsoHeight, 20]} />
                    </mesh>

                    {/* Collar ring */}
                    <mesh position={[0, torsoY + torsoHeight / 2 - 0.01, 0]} material={accentMat}>
                        <torusGeometry args={[torsoRadiusTop * 0.88, 0.022, 8, 24]} />
                    </mesh>

                    {/* Hem line */}
                    <mesh position={[0, torsoY - torsoHeight / 2 + 0.01, 0]} material={accentMat}>
                        <torusGeometry args={[torsoRadiusBot * 0.95, 0.012, 8, 24]} />
                    </mesh>
                </>
            )}

            {/* ── Hips / waistband ── */}
            <mesh position={[0, hipY, 0]} material={material} castShadow>
                <cylinderGeometry args={[hipRadiusTop, hipRadiusBot, 0.22, 20]} />
            </mesh>

            {/* ── Belt line accent ── */}
            <mesh position={[0, hipY + 0.09, 0]} material={accentMat}>
                <torusGeometry args={[hipRadiusTop * 0.92, 0.01, 8, 24]} />
            </mesh>

            {/* ── Sleeves ── */}
            {config.longSleeves && (
                <>
                    <mesh
                        position={[-shoulderOffset, armY, 0]}
                        rotation={[0, 0, 0.15]}
                        material={material}
                        castShadow
                    >
                        <cylinderGeometry args={[0.075, 0.08, armHeight, 14]} />
                    </mesh>
                    <mesh
                        position={[shoulderOffset, armY, 0]}
                        rotation={[0, 0, -0.15]}
                        material={material}
                        castShadow
                    >
                        <cylinderGeometry args={[0.075, 0.08, armHeight, 14]} />
                    </mesh>
                </>
            )}

            {/* ── Short sleeves (cap sleeves for non-long-sleeve styles) ── */}
            {!config.longSleeves && (
                <>
                    <mesh
                        position={[-shoulderOffset, armY + armHeight * 0.15, 0]}
                        rotation={[0, 0, 0.15]}
                        material={material}
                        castShadow
                    >
                        <cylinderGeometry args={[0.075, 0.072, armHeight * 0.35, 14]} />
                    </mesh>
                    <mesh
                        position={[shoulderOffset, armY + armHeight * 0.15, 0]}
                        rotation={[0, 0, -0.15]}
                        material={material}
                        castShadow
                    >
                        <cylinderGeometry args={[0.075, 0.072, armHeight * 0.35, 14]} />
                    </mesh>
                </>
            )}

            {/* ── Pants / Leg shells ── */}
            {config.pants && (
                <>
                    <mesh position={[-legSpacing, upperLegY, 0]} material={material} castShadow>
                        <cylinderGeometry args={[0.1 * scale.hips, 0.085, upperLegH, 14]} />
                    </mesh>
                    <mesh position={[legSpacing, upperLegY, 0]} material={material} castShadow>
                        <cylinderGeometry args={[0.1 * scale.hips, 0.085, upperLegH, 14]} />
                    </mesh>

                    {/* Pant hem cuffs */}
                    <mesh position={[-legSpacing, upperLegY - upperLegH / 2, 0]} material={accentMat}>
                        <torusGeometry args={[0.078, 0.008, 8, 20]} />
                    </mesh>
                    <mesh position={[legSpacing, upperLegY - upperLegH / 2, 0]} material={accentMat}>
                        <torusGeometry args={[0.078, 0.008, 8, 20]} />
                    </mesh>
                </>
            )}
        </group>
    );
}

export default ClothingMesh;
