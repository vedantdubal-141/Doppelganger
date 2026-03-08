import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

import {
    ShirtClothing,
    JacketClothing,
    HoodieClothing,
    PantsClothing,
    SneakerClothing,
    BootClothing,
    DressClothing,
    AccessoryClothing,
} from './ClothingModels';

/**
 * RealisticAvatar — Loads a rigged Xbot humanoid and dresses it
 * using the dedicated ClothingModels renderers.
 *
 * Props:
 *   measurements  — user biometrics { height, weight, shoulderWidth, waist }
 *   outfitColors  — { outerwear, pants, shirt, footwear, accessory, dress } color strings
 *   outfit        — { outerwear, pants, shirt, footwear, accessory, dress } product objects (with modelType)
 */
export default function RealisticAvatar({ measurements = {}, outfitColors = {}, outfit = {} }) {
    const { scene, animations, nodes } = useGLTF('/models/human_avatar.glb');

    // Setup idle animation if present
    const { actions } = useAnimations(animations, scene);
    useEffect(() => {
        const idleAction = actions['idle'] || (Object.values(actions)[0]);
        if (idleAction) {
            idleAction.reset().fadeIn(0.5).play();
        }
        return () => {
            if (idleAction) idleAction.fadeOut(0.5);
        };
    }, [actions]);

    // Apply Biometric Scaling via bone manipulation
    useEffect(() => {
        if (!nodes) return;

        const hScale = measurements.height ? Math.max(0.8, Math.min(1.2, measurements.height / 175)) : 1;
        const wScale = measurements.weight ? Math.max(0.8, Math.min(1.3, (measurements.weight / 70))) : 1;
        const chestScale = measurements.shoulderWidth ? Math.max(0.8, Math.min(1.2, (measurements.shoulderWidth / 45))) : wScale;
        const waistScale = measurements.waist ? Math.max(0.8, Math.min(1.3, (measurements.waist / 80))) : wScale;

        const spine = nodes.Spine;
        const spine2 = nodes.Spine2;
        const leftShoulder = nodes.LeftShoulder;
        const rightShoulder = nodes.RightShoulder;

        // RPM avatars are human-proportioned, so we use base scales
        scene.scale.set(hScale, hScale, hScale);
        scene.position.set(0, -1.8, 0);

        // RPM local bone axes differ from Xbot, so scaling spines directly 
        // with the (x, 1, z) approach squashes the avatar flat. 
        // We will rely on the global hScale and wScale for now.
        if (spine) spine.scale.set(wScale, wScale, wScale);
        if (spine2) spine2.scale.set(1, 1, 1);
        if (leftShoulder) leftShoulder.scale.set(1, 1, 1);
        if (rightShoulder) rightShoulder.scale.set(1, 1, 1);
    }, [measurements, nodes, scene]);

    // Animated color references for smooth transitions
    const targetColors = useRef({
        outerwear: new THREE.Color('#1a1a1a'),
        pants: new THREE.Color('#1a1a1a'),
        accessory: new THREE.Color('#1a1a1a'),
        shirt: new THREE.Color('#1a1a1a'),
        footwear: new THREE.Color('#1a1a1a'),
        dress: new THREE.Color('#1a1a1a'),
        baseSkin: new THREE.Color('#1a1a1a'),
    });

    const currentColors = useRef({
        outerwear: new THREE.Color('#1a1a1a'),
        pants: new THREE.Color('#1a1a1a'),
        accessory: new THREE.Color('#1a1a1a'),
        shirt: new THREE.Color('#1a1a1a'),
        footwear: new THREE.Color('#1a1a1a'),
        dress: new THREE.Color('#1a1a1a'),
        baseSkin: new THREE.Color('#1a1a1a'),
    });

    useEffect(() => {
        ['outerwear', 'pants', 'accessory', 'shirt', 'footwear', 'dress'].forEach(cat => {
            if (outfitColors[cat]) {
                targetColors.current[cat].set(outfitColors[cat]);
            }
        });
        if (outfitColors['shirt']) {
            targetColors.current.baseSkin.set(outfitColors['shirt']);
        } else {
            targetColors.current.baseSkin.set('#1a1a1a');
        }
    }, [outfitColors]);

    useFrame(() => {
        // Smooth lerp all colors
        Object.keys(currentColors.current).forEach(cat => {
            currentColors.current[cat].lerp(targetColors.current[cat], 0.1);
        });

        // Apply to RPM base materials if needed, but they come fully textured
        // so we don't aggressively inject materials like we did for Xbot.
    });

    // Bone references (RPM uses Mixamo bones without the 'mixamorig' prefix)
    const spineNode = nodes?.Spine2;
    const hipsNode = nodes?.Hips;
    const headNode = nodes?.Head;
    const leftFootNode = scene.getObjectByName('LeftFoot');
    const rightFootNode = scene.getObjectByName('RightFoot');
    const leftUpLegNode = scene.getObjectByName('LeftUpLeg');
    const rightUpLegNode = scene.getObjectByName('RightUpLeg');

    // Determine which clothing to render based on outfit products
    const outerwearProduct = outfit.outerwear;
    const shirtProduct = outfit.shirt;
    const pantsProduct = outfit.pants;
    const footwearProduct = outfit.footwear;
    const accessoryProduct = outfit.accessory;
    const dressProduct = outfit.dress;

    // Resolve model types
    const outerwearType = outerwearProduct?.modelType || 'procedural_jacket';
    const pantsType = pantsProduct?.modelType || 'procedural_pants';
    const footwearType = footwearProduct?.modelType || 'procedural_sneakers';
    const accessoryStyle = accessoryProduct?.style || 'vintage';

    return (
        <group dispose={null}>
            <primitive object={scene} castShadow receiveShadow />

            {/* ── SHIRT ── */}
            {outfitColors.shirt && shirtProduct && (
                <ShirtClothing
                    color={currentColors.current.shirt}
                    spineNode={spineNode}
                />
            )}

            {/* ── OUTERWEAR (Jacket / Hoodie) ── */}
            {outfitColors.outerwear && outerwearProduct && (
                <>
                    {outerwearType === 'procedural_hoodie' ? (
                        <HoodieClothing
                            color={currentColors.current.outerwear}
                            spineNode={spineNode}
                            headNode={headNode}
                        />
                    ) : (
                        <JacketClothing
                            color={currentColors.current.outerwear}
                            spineNode={spineNode}
                        />
                    )}
                </>
            )}

            {/* ── PANTS / SHORTS ── */}
            {outfitColors.pants && pantsProduct && (
                <PantsClothing
                    color={currentColors.current.pants}
                    hipsNode={hipsNode}
                    leftUpLegNode={leftUpLegNode}
                    rightUpLegNode={rightUpLegNode}
                    isShorts={pantsType === 'procedural_shorts'}
                />
            )}

            {/* ── FOOTWEAR (Sneakers / Boots) ── */}
            {outfitColors.footwear && footwearProduct && (
                <>
                    {footwearType === 'procedural_boots' ? (
                        <BootClothing
                            color={currentColors.current.footwear}
                            leftFootNode={leftFootNode}
                            rightFootNode={rightFootNode}
                        />
                    ) : (
                        <SneakerClothing
                            color={currentColors.current.footwear}
                            leftFootNode={leftFootNode}
                            rightFootNode={rightFootNode}
                        />
                    )}
                </>
            )}

            {/* ── DRESS ── */}
            {outfitColors.dress && dressProduct && (
                <DressClothing
                    color={currentColors.current.dress}
                    spineNode={spineNode}
                />
            )}

            {/* ── ACCESSORY (Sunglasses / Visor) ── */}
            {outfitColors.accessory && accessoryProduct && (
                <AccessoryClothing
                    color={currentColors.current.accessory}
                    headNode={headNode}
                    style={accessoryStyle}
                />
            )}
        </group>
    );
}

useGLTF.preload('/models/human_avatar.glb');
useGLTF.preload('/models/shirt_baked.glb');
