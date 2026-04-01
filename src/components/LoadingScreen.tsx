'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import * as THREE from 'three';

function SpinningOctahedron() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 1.0;
      meshRef.current.rotation.y += delta * 1.4;
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#FF9500"
        emissive="#FF6000"
        emissiveIntensity={0.4}
        metalness={0.1}
        roughness={0.3}
      />
    </mesh>
  );
}

function DotsText() {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(d => (d + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <p
      style={{
        color: '#888888',
        fontSize: '1.1rem',
        letterSpacing: '0.1em',
        fontFamily: 'var(--font-geist-sans, sans-serif)',
        marginTop: '1.5rem',
        width: '8ch',
        textAlign: 'left',
      }}
    >
      {'Loading' + '.'.repeat(dotCount)}
    </p>
  );
}

export default function LoadingScreen() {
  const { progress, active, total } = useProgress();
  const [visible, setVisible] = useState(true);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);

  useEffect(() => {
    if (active && total > 0) {
      setHasStartedLoading(true);
    }
  }, [active, total]);

  useEffect(() => {
    if (hasStartedLoading && !active && progress >= 100) {
      const timer = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [hasStartedLoading, active, progress]);

  // Fallback: hide after 8s even if progress tracking doesn't fire
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
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
      <div style={{ width: 220, height: 220 }}>
        <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[4, 4, 4]} intensity={2} color="#FFD080" />
          <pointLight position={[-4, -2, 2]} intensity={0.8} color="#FF6030" />
          <SpinningOctahedron />
        </Canvas>
      </div>
      <DotsText />
    </div>
  );
}
