import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * ClothingMesh — A floating "holographic" clothing preview that orbits
 * slightly above/beside the avatar.  Provides a visual cue that the
 * outfit has been applied.
 *
 * Props:
 *   style   — product style string (e.g. "streetwear", "formal")
 *   color   — the accent color for this product
 *   visible — whether to render
 */

/* Map style keywords to simple geometry so each category feels different */
const GEOMETRY_MAP = {
    streetwear: () => new THREE.TorusKnotGeometry(0.18, 0.06, 80, 12),
    casual: () => new THREE.IcosahedronGeometry(0.22, 1),
    formal: () => new THREE.OctahedronGeometry(0.25, 0),
    sportswear: () => new THREE.DodecahedronGeometry(0.22, 0),
    vintage: () => new THREE.TorusGeometry(0.18, 0.07, 16, 40),
    summer: () => new THREE.SphereGeometry(0.22, 8, 6),
    default: () => new THREE.BoxGeometry(0.28, 0.28, 0.28),
};

function ClothingMesh({ style = 'default', color = '#00F0FF', visible = true }) {
    const geometry = useMemo(() => {
        const factory = GEOMETRY_MAP[style] || GEOMETRY_MAP.default;
        return factory();
    }, [style]);

    const material = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color,
                metalness: 0.7,
                roughness: 0.15,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                transparent: true,
                opacity: 0.85,
                emissive: color,
                emissiveIntensity: 0.15,
            }),
        [color]
    );

    if (!visible) return null;

    return (
        <mesh
            geometry={geometry}
            material={material}
            position={[0.9, 0.6, 0]}
            rotation={[0.4, 0.6, 0]}
        >
            {/* Wireframe overlay for holographic look */}
            <mesh geometry={geometry}>
                <meshBasicMaterial
                    color={color}
                    wireframe
                    transparent
                    opacity={0.25}
                />
            </mesh>
        </mesh>
    );
}

export default ClothingMesh;
