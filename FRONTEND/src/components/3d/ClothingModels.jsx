import React, { useMemo } from 'react';
import { createPortal } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ClothingModels — Improved 3D clothing renderers.
 *
 * Uses CylinderGeometry (which renders correctly in bone-local space via createPortal)
 * with high segment counts for smooth surfaces, plus MeshPhysicalMaterial with sheen
 * for realistic fabric appearance.
 *
 * NOTE: createPortal attaches children in bone-local coordinate space. The Xbot bones
 * have their own scales/orientations, so LatheGeometry and other complex meshes get
 * distorted. CylinderGeometry/SphereGeometry work well because they're simple and
 * symmetric.
 */

/* ═══════════════════════════════════════════════════════
 *  Material factories — shared across all clothing
 * ═══════════════════════════════════════════════════════ */
function useFabric(color, opts = {}) {
    return useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#888888',
        roughness: opts.roughness ?? 0.82,
        metalness: opts.metalness ?? 0.02,
        sheen: opts.sheen ?? 0.8,
        sheenRoughness: opts.sheenRoughness ?? 0.35,
        sheenColor: new THREE.Color(0xffffff),
        clearcoat: opts.clearcoat ?? 0.05,
        side: THREE.DoubleSide,
    }), []);
}

function useAccent(color) {
    return useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#666666',
        roughness: 0.4,
        metalness: 0.15,
        sheen: 0.3,
        side: THREE.DoubleSide,
    }), []);
}

function useMetal() {
    return useMemo(() => new THREE.MeshStandardMaterial({
        color: '#AAAAAA', roughness: 0.2, metalness: 0.9,
    }), []);
}

function useRubber() {
    return useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#1a1a1a', roughness: 0.92, metalness: 0, clearcoat: 0.1,
    }), []);
}

/** Sync animated THREE.Color to material */
function syncColor(mat, color) {
    if (!mat || !color) return;
    if (color instanceof THREE.Color) mat.color.copy(color);
    else mat.color.set(color);
}


/* ════════════════════════════════════════════════════════
 *  SHIRT (shirt_baked.glb — the most realistic piece)
 * ════════════════════════════════════════════════════════ */
export function ShirtClothing({ color, spineNode }) {
    const shirtModel = useGLTF('/models/shirt_baked.glb');
    const geometry = shirtModel?.nodes?.T_Shirt_male?.geometry;
    const mat = useFabric(color, { roughness: 0.85, sheen: 0.9 });
    syncColor(mat, color);

    if (!geometry || !spineNode) return null;

    return createPortal(
        <group scale={0.001}>
            <group position={[0, 80, 2]}>
                <mesh castShadow receiveShadow geometry={geometry} scale={[100, 100, 100]} material={mat} />
            </group>
        </group>,
        spineNode
    );
}


/* ════════════════════════════════════════════════════════
 *  JACKET (shirt GLB body + collar ring + shoulder pads + buttons)
 * ════════════════════════════════════════════════════════ */
export function JacketClothing({ color, spineNode }) {
    const shirtModel = useGLTF('/models/shirt_baked.glb');
    const geometry = shirtModel?.nodes?.T_Shirt_male?.geometry;
    const mat = useFabric(color, { roughness: 0.6, sheen: 0.5, clearcoat: 0.15 });
    const accentMat = useAccent(color);
    const metalMat = useMetal();
    syncColor(mat, color);
    syncColor(accentMat, color);

    if (!geometry || !spineNode) return null;

    return createPortal(
        <group scale={0.001}>
            <group position={[0, 80, 2]}>
                {/* Jacket body — oversized shirt */}
                <mesh castShadow receiveShadow geometry={geometry} scale={[108, 105, 110]} material={mat} />

                {/* Collar — open cylinder arc */}
                <mesh position={[0, 32, 4]} rotation={[-0.3, 0, 0]} castShadow material={mat}>
                    <cylinderGeometry args={[10.5, 11, 5, 24, 1, true, -Math.PI * 0.6, Math.PI * 1.2]} />
                </mesh>

                {/* Left lapel */}
                <mesh position={[-5.5, 22, 13]} rotation={[0.12, 0.25, -0.08]} castShadow material={accentMat}>
                    <planeGeometry args={[6, 16, 1, 4]} />
                </mesh>
                {/* Right lapel */}
                <mesh position={[5.5, 22, 13]} rotation={[0.12, -0.25, 0.08]} castShadow material={accentMat}>
                    <planeGeometry args={[6, 16, 1, 4]} />
                </mesh>

                {/* Button line */}
                <mesh position={[0, 10, 13.5]} material={metalMat}>
                    <boxGeometry args={[0.3, 28, 0.15]} />
                </mesh>
                {/* Buttons */}
                {[20, 13, 6, -1].map((y, i) => (
                    <mesh key={i} position={[0, y, 14]} material={metalMat}>
                        <cylinderGeometry args={[0.7, 0.7, 0.3, 12]} />
                    </mesh>
                ))}

                {/* Left shoulder structure */}
                <mesh position={[-16, 28, 0]} rotation={[0, 0, 0.5]} castShadow material={mat}>
                    <sphereGeometry args={[4, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
                </mesh>
                {/* Right shoulder structure */}
                <mesh position={[16, 28, 0]} rotation={[0, 0, -0.5]} castShadow material={mat}>
                    <sphereGeometry args={[4, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
                </mesh>

                {/* Left pocket welt */}
                <mesh position={[-8, 0, 13.5]} material={accentMat}>
                    <boxGeometry args={[6, 0.5, 0.3]} />
                </mesh>
                {/* Right pocket welt */}
                <mesh position={[8, 0, 13.5]} material={accentMat}>
                    <boxGeometry args={[6, 0.5, 0.3]} />
                </mesh>
            </group>
        </group>,
        spineNode
    );
}


/* ════════════════════════════════════════════════════════
 *  HOODIE (soft shirt body + kangaroo pocket + hood)
 * ════════════════════════════════════════════════════════ */
export function HoodieClothing({ color, spineNode, headNode }) {
    const shirtModel = useGLTF('/models/shirt_baked.glb');
    const geometry = shirtModel?.nodes?.T_Shirt_male?.geometry;
    const mat = useFabric(color, { roughness: 0.92, sheen: 1.0, sheenRoughness: 0.25 });
    syncColor(mat, color);

    const stringMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#dddddd', roughness: 0.95,
    }), []);

    if (!geometry || !spineNode) return null;

    return (
        <>
            {spineNode && createPortal(
                <group scale={0.001}>
                    <group position={[0, 80, 2]}>
                        {/* Hoodie body — oversized and soft */}
                        <mesh castShadow receiveShadow geometry={geometry} scale={[112, 108, 114]} material={mat} />

                        {/* Kangaroo pocket */}
                        <mesh position={[0, -5, 14]} rotation={[0.06, 0, 0]} castShadow material={mat}>
                            <boxGeometry args={[16, 7, 1.2]} />
                        </mesh>
                        {/* Pocket slit */}
                        <mesh position={[0, -2.5, 14.5]} material={stringMat}>
                            <boxGeometry args={[12, 0.3, 0.2]} />
                        </mesh>

                        {/* Ribbed hem band */}
                        <mesh position={[0, -17, 0]} castShadow material={mat}>
                            <cylinderGeometry args={[14.5, 14, 3.5, 32, 1, true]} />
                        </mesh>

                        {/* Drawstrings */}
                        <mesh position={[-2.5, 28, 12]} material={stringMat}>
                            <cylinderGeometry args={[0.2, 0.2, 12, 6]} />
                        </mesh>
                        <mesh position={[2.5, 28, 12]} material={stringMat}>
                            <cylinderGeometry args={[0.2, 0.2, 12, 6]} />
                        </mesh>
                        {/* Aglets */}
                        <mesh position={[-2.5, 22, 12]} material={metalMat}>
                            <cylinderGeometry args={[0.35, 0.25, 1.2, 8]} />
                        </mesh>
                        <mesh position={[2.5, 22, 12]} material={metalMat}>
                            <cylinderGeometry args={[0.35, 0.25, 1.2, 8]} />
                        </mesh>
                    </group>
                </group>,
                spineNode
            )}
            {headNode && createPortal(
                <group scale={0.001}>
                    <group position={[0, 80, 2]}>
                        {/* Hood — half sphere draped behind head */}
                        <mesh castShadow material={mat}>
                            <sphereGeometry args={[13, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                        </mesh>
                    </group>
                </group>,
                headNode
            )}
        </>
    );
}

// Shared metal material for hoodie aglets
const metalMat = new THREE.MeshStandardMaterial({
    color: '#999999', roughness: 0.2, metalness: 0.85,
});


/* ════════════════════════════════════════════════════════
 *  PANTS — Each leg portalled to its own skeleton bone
 *  Waistband + belt portalled to hips separately.
 * ════════════════════════════════════════════════════════ */
export function PantsClothing({ color, hipsNode, leftUpLegNode, rightUpLegNode, isShorts = false }) {
    const mat = useFabric(color, { roughness: 0.78, sheen: 0.6 });
    const beltMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#2a2a2a', roughness: 0.45, metalness: 0.1,
        sheen: 0.3, sheenColor: new THREE.Color('#443322'),
        clearcoat: 0.3,
    }), []);
    const buckleMat = useMetal();
    syncColor(mat, color);

    const legLen = isShorts ? 15 : 32;
    const topR = 5;
    const botR = isShorts ? 4.5 : 3.8;

    // Render a single pant leg
    const makeLeg = () => (
        <group scale={0.001}>
            <group position={[0, -18, 0]}>
                <mesh castShadow material={mat}>
                    <cylinderGeometry args={[topR, botR, legLen, 24]} />
                </mesh>
                {/* Cuff */}
                {!isShorts && (
                    <mesh position={[0, -legLen / 2, 0]} material={mat}>
                        <torusGeometry args={[botR - 0.1, 0.35, 8, 18]} />
                    </mesh>
                )}
            </group>
        </group>
    );

    return (
        <>
            {/* Waistband + belt portalled to hips */}
            {hipsNode && createPortal(
                <group scale={0.001}>
                    <group position={[0, -3, 2]}>
                        {/* Waistband */}
                        <mesh position={[0, 2, 0]} castShadow material={mat}>
                            <cylinderGeometry args={[12, 11.5, 5, 28]} />
                        </mesh>

                        {/* Crotch bridge */}
                        <mesh position={[0, -2, 0]} castShadow material={mat}>
                            <cylinderGeometry args={[6, 6, 4, 20]} />
                        </mesh>

                        {/* Belt */}
                        <mesh position={[0, 5, 0]} material={beltMat}>
                            <torusGeometry args={[11.8, 0.7, 8, 28]} />
                        </mesh>

                        {/* Belt buckle */}
                        <mesh position={[0, 5, 11.5]} material={buckleMat}>
                            <boxGeometry args={[2.5, 1.8, 0.5]} />
                        </mesh>

                        {/* Belt loops */}
                        <mesh position={[-7, 5, 9]} material={mat}>
                            <boxGeometry args={[0.8, 2, 0.3]} />
                        </mesh>
                        <mesh position={[7, 5, 9]} material={mat}>
                            <boxGeometry args={[0.8, 2, 0.3]} />
                        </mesh>
                        <mesh position={[0, 5, -11]} material={mat}>
                            <boxGeometry args={[0.8, 2, 0.3]} />
                        </mesh>
                    </group>
                </group>,
                hipsNode
            )}

            {/* Left leg portalled to left upper leg bone */}
            {leftUpLegNode && createPortal(
                <group scale={0.01} >{makeLeg()}</group>,
                leftUpLegNode
            )}

            {/* Right leg portalled to right upper leg bone */}
            {rightUpLegNode && createPortal(
                <group scale={0.01} >{makeLeg()}</group>,
                rightUpLegNode
            )}
        </>
    );
}

/* ════════════════════════════════════════════════════════
 *  SNEAKERS — Smaller, properly scaled for foot bones
 * ════════════════════════════════════════════════════════ */
export function SneakerClothing({ color, leftFootNode, rightFootNode }) {
    const upperMat = useFabric(color, { roughness: 0.6, sheen: 0.4, clearcoat: 0.2 });
    const soleMat = useRubber();
    const laceMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#ffffff', roughness: 0.9,
    }), []);
    syncColor(upperMat, color);

    const makeSneaker = () => (
        <group scale={0.001}>
            <group position={[0, -1, 3]} scale={[0.7, 0.7, 0.7]}>
                {/* Main shoe body */}
                <mesh position={[0, 2, 0]} castShadow material={upperMat}>
                    <cylinderGeometry args={[4.5, 5, 6, 16]} />
                </mesh>
                {/* Toe cap */}
                <mesh position={[0, 1, 6]} castShadow material={upperMat}>
                    <sphereGeometry args={[4, 14, 10]} />
                </mesh>
                {/* Sole */}
                <mesh position={[0, -1.5, 1.5]} castShadow material={soleMat}>
                    <boxGeometry args={[9, 2, 14]} />
                </mesh>
                {/* Ankle collar */}
                <mesh position={[0, 5.5, -1]} material={upperMat}>
                    <torusGeometry args={[3.8, 1, 8, 12]} />
                </mesh>
                {/* Tongue */}
                <mesh position={[0, 4.5, 3]} rotation={[-0.3, 0, 0]} material={upperMat}>
                    <boxGeometry args={[3, 4, 0.4]} />
                </mesh>
                {/* Laces */}
                {[0, 1, 2].map(i => (
                    <mesh key={i} position={[0, 3.5 + i * 1, 3 - i * 0.2]} material={laceMat}>
                        <boxGeometry args={[3.5, 0.2, 0.12]} />
                    </mesh>
                ))}
            </group>
        </group>
    );

    return (
        <>
            {leftFootNode && createPortal(makeSneaker(), leftFootNode)}
            {rightFootNode && createPortal(makeSneaker(), rightFootNode)}
        </>
    );
}

/* ════════════════════════════════════════════════════════
 *  BOOTS (taller shaft + structured heel)
 * ════════════════════════════════════════════════════════ */
export function BootClothing({ color, leftFootNode, rightFootNode }) {
    const leatherMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#333333', roughness: 0.45, metalness: 0.1,
        sheen: 0.3, sheenColor: new THREE.Color('#443322'),
        clearcoat: 0.3, clearcoatRoughness: 0.4, side: THREE.DoubleSide,
    }), []);
    const soleMat = useRubber();
    const accentMat = useAccent(color);
    syncColor(leatherMat, color);

    const makeBoot = () => (
        <group scale={0.001}>
            <group position={[0, 2, 4]} scale={[1.2, 1.2, 1.2]}>
                {/* Boot shaft */}
                <mesh position={[0, 10, -1]} castShadow material={leatherMat}>
                    <cylinderGeometry args={[4.8, 5.2, 16, 18]} />
                </mesh>
                {/* Top collar */}
                <mesh position={[0, 18, -1]} material={leatherMat}>
                    <torusGeometry args={[4.6, 0.6, 8, 16]} />
                </mesh>
                {/* Foot section */}
                <mesh position={[0, 1, 2]} castShadow material={leatherMat}>
                    <cylinderGeometry args={[5.2, 5.5, 6, 16]} />
                </mesh>
                {/* Toe */}
                <mesh position={[0, 0.5, 8]} castShadow material={leatherMat}>
                    <sphereGeometry args={[4.5, 14, 10]} />
                </mesh>
                {/* Sole */}
                <mesh position={[0, -2, 2]} material={soleMat}>
                    <boxGeometry args={[10, 2, 16]} />
                </mesh>
                {/* Heel block */}
                <mesh position={[0, -2.5, -4]} material={soleMat}>
                    <boxGeometry args={[8, 3.5, 4]} />
                </mesh>
                {/* Pull tab */}
                <mesh position={[0, 19, -5]} material={leatherMat}>
                    <boxGeometry args={[2, 3, 0.4]} />
                </mesh>
            </group>
        </group>
    );

    return (
        <>
            {leftFootNode && createPortal(makeBoot(), leftFootNode)}
            {rightFootNode && createPortal(makeBoot(), rightFootNode)}
        </>
    );
}

/* ════════════════════════════════════════════════════════
 *  DRESS (shirt bodice + flowing skirt cylinder)
 * ════════════════════════════════════════════════════════ */
export function DressClothing({ color, spineNode }) {
    const shirtModel = useGLTF('/models/shirt_baked.glb');
    const geometry = shirtModel?.nodes?.T_Shirt_male?.geometry;
    const mat = useFabric(color, { roughness: 0.5, sheen: 0.9, sheenRoughness: 0.2, clearcoat: 0.15 });
    const accentMat = useFabric('#222222', { roughness: 0.9, sheen: 0.2 });
    syncColor(mat, color);

    if (!spineNode) return null;

    return createPortal(
        <group scale={0.001}>
            <group position={[0, 80, 2]}>
                {/* Bodice */}
                {geometry && (
                    <mesh castShadow receiveShadow geometry={geometry} scale={[100, 102, 105]} material={mat} />
                )}
                {/* Long flowing skirt */}
                <mesh position={[0, -32, 0]} castShadow receiveShadow material={mat}>
                    <cylinderGeometry args={[16, 22, 42, 32]} />
                </mesh>
                {/* Waist cinch/sash */}
                <mesh position={[0, -11, 0]} material={accentMat}>
                    <torusGeometry args={[15.5, 1.0, 8, 24]} />
                </mesh>
            </group>
        </group>,
        spineNode
    );
}

/* ════════════════════════════════════════════════════════
 *  ACCESSORY — Sunglasses / Cyber Visor
 * ════════════════════════════════════════════════════════ */
export function AccessoryClothing({ color, headNode, style = 'vintage' }) {
    const frameMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#1a1a1a', roughness: 0.3, metalness: 0.7,
        clearcoat: 0.8, clearcoatRoughness: 0.1,
    }), []);

    const lensMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#444444',
        metalness: 0.5, roughness: 0.1,
        opacity: 0.5, transparent: true,
        clearcoat: 1.0, clearcoatRoughness: 0.05,
    }), []);
    syncColor(lensMat, color);

    if (!headNode) return null;

    if (style === 'streetwear') {
        return createPortal(
            <group scale={0.001}>
                <group position={[0, 4, 10]}>
                    <mesh position={[0, 0, 0]} castShadow material={lensMat}>
                        <cylinderGeometry args={[12, 12, 5, 24, 1, true, -Math.PI * 0.4, Math.PI * 0.8]} />
                    </mesh>
                    <mesh position={[0, 2.5, 0]} material={frameMat}>
                        <torusGeometry args={[12, 0.35, 6, 24, Math.PI * 0.8]} />
                    </mesh>
                    <mesh position={[-11, 0, -7]} material={frameMat}>
                        <cylinderGeometry args={[0.4, 0.4, 14, 8]} />
                    </mesh>
                    <mesh position={[11, 0, -7]} material={frameMat}>
                        <cylinderGeometry args={[0.4, 0.4, 14, 8]} />
                    </mesh>
                </group>
            </group>,
            headNode
        );
    }

    return createPortal(
        <group scale={0.001}>
            <group position={[0, 4, 15]}>
                <mesh position={[-5, 0, 0]} material={lensMat} castShadow>
                    <sphereGeometry args={[3.5, 18, 18, 0, Math.PI, 0, Math.PI * 0.85]} />
                </mesh>
                <mesh position={[5, 0, 0]} material={lensMat} castShadow>
                    <sphereGeometry args={[3.5, 18, 18, 0, Math.PI, 0, Math.PI * 0.85]} />
                </mesh>
                <mesh position={[-5, 0, 0]} material={frameMat}>
                    <torusGeometry args={[3.6, 0.2, 6, 18]} />
                </mesh>
                <mesh position={[5, 0, 0]} material={frameMat}>
                    <torusGeometry args={[3.6, 0.2, 6, 18]} />
                </mesh>
            </group>
        </group>,
        headNode
    );
}
