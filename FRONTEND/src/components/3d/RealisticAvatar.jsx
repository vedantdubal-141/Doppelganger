import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

/**
 * RealisticAvatar — Replaces the primitive shape mannequin.
 * Loads a realistic rigged humanoid (Xbot), scales its bones dynamically based on biometrics,
 * and changes its material color to simulate a seamless futuristic clothing layer.
 */
export default function RealisticAvatar({ measurements = {}, clothingColor = '#00F0FF', style = 'streetwear' }) {
    // Load the GLTF. The path must be relative to the public folder.
    const { scene, animations, nodes, materials } = useGLTF('/models/avatar.glb');

    // Setup idle animation if present
    const { actions } = useAnimations(animations, scene);
    useEffect(() => {
        // Play the first animation (idle) if it exists, Xbot usually has "idle" or we just let it T-pose/A-pose
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

        // Base frame is approx 175cm, 70kg, 45cm shoulders, 80cm waist.
        const hScale = measurements.height ? Math.max(0.8, Math.min(1.2, measurements.height / 175)) : 1;
        const wScale = measurements.weight ? Math.max(0.8, Math.min(1.3, (measurements.weight / 70))) : 1;
        const chestScale = measurements.shoulderWidth ? Math.max(0.8, Math.min(1.2, (measurements.shoulderWidth / 45))) : wScale;
        const waistScale = measurements.waist ? Math.max(0.8, Math.min(1.3, (measurements.waist / 80))) : wScale;

        // Xbot/Mixamo bone hierarchy names
        const rootNode = nodes.mixamorigHips;
        const spine = nodes.mixamorigSpine;
        const spine1 = nodes.mixamorigSpine1;
        const spine2 = nodes.mixamorigSpine2;
        const leftShoulder = nodes.mixamorigLeftShoulder;
        const rightShoulder = nodes.mixamorigRightShoulder;

        // Scale overall model for height
        // Warning: scaling the scene directly is safer than scaling root bone for global height
        scene.scale.set(hScale * 1.5, hScale * 1.5, hScale * 1.5); // Baseline 1.5x up-scale for Canvas composition
        scene.position.set(0, -1.8, 0); // Ground it

        // Scale specific bones for width/girth
        if (spine) {
            // X, Z are horizontal girth axes in this rig space usually
            spine.scale.set(waistScale, 1, waistScale);
        }
        if (spine2) {
            spine2.scale.set(chestScale, 1, chestScale);
        }
        if (leftShoulder) leftShoulder.scale.set(chestScale, 1, 1);
        if (rightShoulder) rightShoulder.scale.set(chestScale, 1, 1);

    }, [measurements, nodes, scene]);

    // Handle Clothing/Material color overrides
    const targetColor = useRef(new THREE.Color(clothingColor));
    const currentColor = useRef(new THREE.Color(clothingColor));

    useEffect(() => {
        targetColor.current.set(clothingColor);
    }, [clothingColor]);

    useFrame(() => {
        // Smooth lerp color
        currentColor.current.lerp(targetColor.current, 0.1);

        // Traverse scene and apply to specific Xbot materials (Alpha_Surface is the outer shell)
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                // Xbot has two main materials: 'Alpha_Surface' and 'Alpha_Joints'
                if (child.material.name === 'Alpha_Surface') {
                    // Turn it into a neon fabric
                    child.material.color.copy(currentColor.current);
                    child.material.roughness = 0.4;
                    child.material.metalness = 0.3;
                    child.material.needsUpdate = true;
                } else if (child.material.name === 'Alpha_Joints') {
                    // Turn joints into dark chrome/cyber skeleton
                    child.material.color.setHex(0x1a1a1a);
                    child.material.roughness = 0.2;
                    child.material.metalness = 0.8;
                    child.material.needsUpdate = true;
                }
            }
        });
    });

    return (
        <group dispose={null}>
            <primitive object={scene} castShadow receiveShadow />
        </group>
    );
}

useGLTF.preload('/models/avatar.glb');
