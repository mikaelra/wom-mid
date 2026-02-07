'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 30;
const DURATION = 1.2;
const EXPLOSION_SPEED = 2.5;

type Props = {
  position: [number, number, number];
  onComplete: () => void;
};

function ExplosionEffect({ position, onComplete }: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const startTime = useRef<number | null>(null);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities: [number, number, number][] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random outward direction with upward bias
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      const speed = 0.5 + Math.random() * EXPLOSION_SPEED;
      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = Math.cos(phi) * speed;
      const vz = Math.sin(phi) * Math.sin(theta) * speed;

      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      velocities.push([vx, vy, vz]);
    }

    return { positions, velocities };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const points = pointsRef.current;
    const posAttr = points.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    if (startTime.current === null) {
      startTime.current = performance.now() / 1000;
    }

    const elapsed = performance.now() / 1000 - startTime.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posArray[i * 3] += velocities[i][0] * delta;
      posArray[i * 3 + 1] += velocities[i][1] * delta;
      posArray[i * 3 + 2] += velocities[i][2] * delta;
    }

    // Shrink particles over time so they disappear (keeps explosion opaque = behind character)
    const alpha = Math.max(0, 1 - elapsed / DURATION);
    if (points.material instanceof THREE.PointsMaterial) {
      points.material.size = 0.06 * alpha;
    }

    posAttr.needsUpdate = true;

    if (elapsed >= DURATION) {
      onComplete();
    }
  });

  return (
    <points ref={pointsRef} position={position} renderOrder={-10}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ff6b35"
        transparent={false}
        opacity={1}
        sizeAttenuation
        depthWrite={true}
        depthTest={true}
      />
    </points>
  );
}

export default ExplosionEffect;
