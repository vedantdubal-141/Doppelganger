import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei';

/**
 * Scene — R3F Canvas wrapper with lighting, controls, environment,
 * and a ground grid platform. Wrapped in ErrorBoundary externally.
 */
function Scene({ children }) {
  return (
    <Canvas
      camera={{ position: [0, 0.8, 3.8], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      shadows
      style={{ background: 'transparent' }}
    >
      {/* Ambient fill */}
      <ambientLight intensity={0.5} color="#b0c4ff" />

      {/* Main key light */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.4}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Fill light from left */}
      <directionalLight position={[-4, 4, 2]} intensity={0.4} color="#e0e0ff" />

      {/* Neon rim lights for retro-futurism */}
      <pointLight position={[-3, 2, -2]} intensity={0.6} color="#00F0FF" />
      <pointLight position={[3, 2, -2]} intensity={0.4} color="#7B61FF" />
      <pointLight position={[0, -1, 3]} intensity={0.3} color="#FF2EA6" />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Contact shadow beneath model */}
      <ContactShadows
        position={[0, -1.22, 0]}
        opacity={0.5}
        scale={6}
        blur={2.5}
        far={4}
      />

      {/* Ground grid platform */}
      <Grid
        position={[0, -1.22, 0]}
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#1a1a3a"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#00F0FF"
        fadeDistance={8}
        fadeStrength={1.5}
        infiniteGrid
      />

      {/* User-orbit */}
      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={7}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate
        autoRotateSpeed={0.8}
        target={[0, 0.3, 0]}
      />

      <Suspense fallback={
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#00F0FF" wireframe transparent opacity={0.5} />
        </mesh>
      }>
        {children}
      </Suspense>
    </Canvas>
  );
}

export default Scene;
