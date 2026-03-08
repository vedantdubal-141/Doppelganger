import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, createPortal } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

/**
 * RealisticAvatar — Replaces the primitive shape mannequin.
 * Loads a realistic rigged humanoid (Xbot), scales its bones dynamically based on biometrics,
 * and attaches physical 3D geometric parts (cyber armor, visors, etc) based on the full outfit.
 */
export default function RealisticAvatar({ measurements = {}, outfitColors = {}, clothingColor = '#00F0FF' }) {
    // Load the GLTF. The path must be relative to the public folder.
    const { scene, animations, nodes, materials } = useGLTF('/models/avatar.glb');
    const shirtModel = useGLTF('/models/shirt_baked.glb');

    useEffect(() => {
        if (shirtModel?.nodes?.T_Shirt_male?.geometry) {
            shirtModel.nodes.T_Shirt_male.geometry.computeBoundingBox();
            console.log("SHIRT BOUNDING BOX:", JSON.stringify(shirtModel.nodes.T_Shirt_male.geometry.boundingBox));
        }
    }, [shirtModel]);

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

    // Handle Clothing/Material color overrides for multiple layers
    const targetColors = useRef({
        outerwear: new THREE.Color(),
        pants: new THREE.Color(),
        accessory: new THREE.Color(),
        shirt: new THREE.Color(),
        footwear: new THREE.Color(),
        baseSkin: new THREE.Color('#1a1a1a'),
    });

    const currentColors = useRef({
        outerwear: new THREE.Color(),
        pants: new THREE.Color(),
        accessory: new THREE.Color(),
        shirt: new THREE.Color(),
        footwear: new THREE.Color(),
        baseSkin: new THREE.Color('#1a1a1a'),
    });

    useEffect(() => {
        ['outerwear', 'pants', 'accessory', 'shirt', 'footwear'].forEach(cat => {
            if (outfitColors[cat]) {
                targetColors.current[cat].set(outfitColors[cat]);
            } else if (cat === 'shirt' && clothingColor) {
                // Fallback to legacy clothingColor if specific shirt color missing
                targetColors.current[cat].set(clothingColor);
            }
        });
        // If shirt exists, base outer shell reflects shirt color. Otherwise dark cyber skin.
        if (outfitColors['shirt'] || clothingColor) {
            targetColors.current.baseSkin.set(outfitColors['shirt'] || clothingColor);
        } else {
            targetColors.current.baseSkin.set('#1a1a1a');
        }
    }, [outfitColors, clothingColor]);

    useFrame(() => {
        // Smooth lerp colors
        ['outerwear', 'pants', 'accessory', 'shirt', 'footwear', 'baseSkin'].forEach(cat => {
            currentColors.current[cat].lerp(targetColors.current[cat], 0.1);
        });

        // Traverse scene and apply to specific Xbot materials (Alpha_Surface is the outer shell)
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.name === 'Alpha_Surface') {
                    child.material.color.copy(currentColors.current.baseSkin);
                    child.material.roughness = 0.4;
                    child.material.metalness = 0.3;
                    child.material.needsUpdate = true;
                } else if (child.material.name === 'Alpha_Joints') {
                    child.material.color.setHex(0x1a1a1a);
                    child.material.roughness = 0.2;
                    child.material.metalness = 0.8;
                    child.material.needsUpdate = true;
                }
            }
        });
    });

    // Extract dynamic 3D parts based on active outfit
    const outerwearParts = nodes?.mixamorigSpine2 && outfitColors['outerwear'] ? (
        createPortal(
            <group position={[0, -2, 2]} rotation={[0, 0, 0]}>
                {/* Real T-Shirt Model mapped to act as Outerwear / Jacket */}
                <mesh castShadow receiveShadow geometry={shirtModel?.nodes?.T_Shirt_male?.geometry} scale={[105, 105, 105]}>
                    <meshStandardMaterial color={currentColors.current.outerwear} roughness={0.6} metalness={0.1} />
                </mesh>
                {/* Shoulder Guards */}
                <mesh position={[-20, 25, -5]} rotation={[0, 0, 0.4]} castShadow receiveShadow>
                    <cylinderGeometry args={[8, 8, 15, 16]} />
                    <meshStandardMaterial color={currentColors.current.outerwear} roughness={0.3} metalness={0.7} />
                </mesh>
                <mesh position={[20, 25, -5]} rotation={[0, 0, -0.4]} castShadow receiveShadow>
                    <cylinderGeometry args={[8, 8, 15, 16]} />
                    <meshStandardMaterial color={currentColors.current.outerwear} roughness={0.3} metalness={0.7} />
                </mesh>
            </group>,
            nodes.mixamorigSpine2
        )
    ) : null;

    const pantsParts = nodes?.mixamorigHips && outfitColors['pants'] ? (
        createPortal(
            <group position={[0, -5, 5]}>
                {/* Tech Belt */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[40, 5, 25]} />
                    <meshStandardMaterial color="#2d2d2d" roughness={0.5} metalness={0.9} />
                </mesh>
                <mesh position={[0, 0, 13]}>
                    <boxGeometry args={[10, 8, 2]} />
                    <meshStandardMaterial color={currentColors.current.pants} emissive={currentColors.current.pants} emissiveIntensity={0.5} />
                </mesh>
            </group>,
            nodes.mixamorigHips
        )
    ) : null;

    const accessoryParts = nodes?.mixamorigHead && outfitColors['accessory'] ? (
        createPortal(
            <group position={[0, 12, 10]}>
                {/* Cyber Visor */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[18, 5, 15]} />
                    <meshStandardMaterial color={currentColors.current.accessory} metalness={0.9} roughness={0.1} opacity={0.8} transparent />
                </mesh>
            </group>,
            nodes.mixamorigHead
        )
    ) : null;

    const shirtParts = nodes?.mixamorigSpine2 && (outfitColors['shirt'] || clothingColor) ? (
        createPortal(
            <group position={[0, -2, 2]} rotation={[0, 0, 0]}>
                {/* Real T-Shirt Model mapped to act as Shirt */}
                <mesh castShadow receiveShadow geometry={shirtModel?.nodes?.T_Shirt_male?.geometry} scale={[95, 95, 95]}>
                    <meshStandardMaterial color={currentColors.current.shirt} roughness={0.8} metalness={0.1} />
                </mesh>
            </group>,
            nodes.mixamorigSpine2
        )
    ) : null;

    const leftFootNode = scene.getObjectByName('mixamorigLeftFoot');
    const rightFootNode = scene.getObjectByName('mixamorigRightFoot');

    const footwearParts = leftFootNode && rightFootNode && outfitColors['footwear'] ? (
        <>
            {createPortal(
                <group position={[0, 0, 4]}>
                    <mesh position={[0, 6, -2]} castShadow>
                        <cylinderGeometry args={[4.5, 4, 12, 16]} />
                        <meshStandardMaterial color={currentColors.current.footwear} roughness={0.6} metalness={0.2} />
                    </mesh>
                    <mesh position={[0, -2, 2]} castShadow>
                        <boxGeometry args={[10, 6, 18]} />
                        <meshStandardMaterial color={currentColors.current.footwear} roughness={0.8} metalness={0.1} />
                    </mesh>
                    <mesh position={[0, -2, 11]} castShadow>
                        <sphereGeometry args={[5, 16, 16]} />
                        <meshStandardMaterial color={currentColors.current.footwear} roughness={0.8} metalness={0.1} />
                    </mesh>
                </group>,
                leftFootNode
            )}
            {createPortal(
                <group position={[0, 0, 4]}>
                    <mesh position={[0, 6, -2]} castShadow>
                        <cylinderGeometry args={[4.5, 4, 12, 16]} />
                        <meshStandardMaterial color={currentColors.current.footwear} roughness={0.6} metalness={0.2} />
                    </mesh>
                    <mesh position={[0, -2, 2]} castShadow>
                        <boxGeometry args={[10, 6, 18]} />
                        <meshStandardMaterial color={currentColors.current.footwear} roughness={0.8} metalness={0.1} />
                    </mesh>
                    <mesh position={[0, -2, 11]} castShadow>
                        <sphereGeometry args={[5, 16, 16]} />
                        <meshStandardMaterial color={currentColors.current.footwear} roughness={0.8} metalness={0.1} />
                    </mesh>
                </group>,
                rightFootNode
            )}
        </>
    ) : null;

    return (
        <group dispose={null}>
            <primitive object={scene} castShadow receiveShadow />
            {outerwearParts}
            {pantsParts}
            {accessoryParts}
            {shirtParts}
            {footwearParts}
        </group>
    );
}

useGLTF.preload('/models/avatar.glb');
useGLTF.preload('/models/shirt_baked.glb');
