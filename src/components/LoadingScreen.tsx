'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import * as THREE from 'three';

const STYLES = `
  @keyframes wom-dot-1 {
    0%    { opacity: 1; }
    75%   { opacity: 1; }
    75.1% { opacity: 0; }
    100%  { opacity: 0; }
  }
  @keyframes wom-dot-2 {
    0%    { opacity: 0; }
    25%   { opacity: 0; }
    25.1% { opacity: 1; }
    75%   { opacity: 1; }
    75.1% { opacity: 0; }
    100%  { opacity: 0; }
  }
  @keyframes wom-dot-3 {
    0%    { opacity: 0; }
    50%   { opacity: 0; }
    50.1% { opacity: 1; }
    75%   { opacity: 1; }
    75.1% { opacity: 0; }
    100%  { opacity: 0; }
  }
`;

function SpinningOctahedron() {
  const groupRef = useRef<THREE.Group>(null);

  const geo = useMemo(() => new THREE.OctahedronGeometry(1, 0), []);
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Organic spin: base rate modulated by slow sine waves on each axis
    groupRef.current.rotation.x += delta * (0.35 + 0.28 * Math.sin(t * 0.53));
    groupRef.current.rotation.y += delta * (0.60 + 0.40 * Math.sin(t * 0.37));
    groupRef.current.rotation.z += delta * (0.10 + 0.18 * Math.sin(t * 0.81));
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geo}>
        <meshStandardMaterial
          color="#FF9200"
          emissive="#FF5200"
          emissiveIntensity={0.38}
          metalness={0.15}
          roughness={0.30}
        />
      </mesh>
      {/* Grey edge lines at every edge of the octahedron */}
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color="#aaaaaa" />
      </lineSegments>
    </group>
  );
}

export default function LoadingScreen() {
  const { progress, active, total } = useProgress();
  const [visible, setVisible] = useState(true);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);

  useEffect(() => {
    if (active && total > 0) setHasStartedLoading(true);
  }, [active, total]);

  useEffect(() => {
    if (hasStartedLoading && !active && progress >= 100) {
      const timer = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [hasStartedLoading, active, progress]);

  // Fallback: hide after 8 s if progress tracking never fires (cached assets)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{STYLES}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        {/* Title — matches the globe scene style */}
        <p
          style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.9rem',
            fontWeight: 300,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-geist-sans, sans-serif)',
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          }}
        >
          World of Mythos
        </p>

        {/* R3F canvas — isolated, transparent background */}
        <div style={{ width: 220, height: 220, flexShrink: 0 }}>
          <Canvas
            camera={{ position: [0, 0, 3.5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            style={{ width: '100%', height: '100%', display: 'block' }}
            frameloop="always"
          >
            <ambientLight intensity={0.55} />
            <pointLight position={[4, 4, 4]} intensity={2.2} color="#FFD080" />
            <pointLight position={[-3, -2, 2]} intensity={0.9} color="#FF6030" />
            <SpinningOctahedron />
          </Canvas>
        </div>

        {/* Loading text with CSS-animated dots */}
        <p
          style={{
            color: '#888888',
            fontSize: '1.1rem',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-geist-sans, sans-serif)',
            marginTop: '1.25rem',
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          Loading
          <span style={{ animation: 'wom-dot-1 2s linear infinite', marginLeft: 1 }}>.</span>
          <span style={{ animation: 'wom-dot-2 2s linear infinite' }}>.</span>
          <span style={{ animation: 'wom-dot-3 2s linear infinite' }}>.</span>
        </p>
      </div>
    </>
  );
}
