import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';

/**
 * Scene — R3F Canvas wrapper with lighting, controls & environment.
 * Wrapped in an ErrorBoundary externally (see VirtualTryOn.jsx).
 */
function Scene({ children }) {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      {/* Ambient fill */}
      <ambientLight intensity={0.4} color="#b0c4ff" />

      {/* Main key light */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow
      />

      {/* Neon rim lights for retro-futurism */}
      <pointLight position={[-3, 2, -2]} intensity={0.6} color="#00F0FF" />
      <pointLight position={[3, 2, -2]} intensity={0.4} color="#7B61FF" />
      <pointLight position={[0, -1, 3]} intensity={0.3} color="#FF2EA6" />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Contact shadow beneath model */}
      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.4}
        scale={6}
        blur={2.5}
        far={4}
      />

      {/* User-orbit */}
      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate
        autoRotateSpeed={1.2}
      />

      <Suspense fallback={null}>
        {children}
      </Suspense>
    </Canvas>
  );
}

export default Scene;
