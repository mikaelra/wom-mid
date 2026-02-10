'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { LobbyState } from '@/types/game';

// Camera that settles into a forest clearing view
function ForestCamera() {
  const { camera, size } = useThree();
  const pos = useRef(new THREE.Vector3(0, 8, 12));

  useFrame(() => {
    const aspect = size.width / size.height;
    const targetZ = aspect > 1.2 ? 6 : 7;
    const target = new THREE.Vector3(0, 2.5, targetZ);
    pos.current.lerp(target, 0.03);
    camera.position.copy(pos.current);
    camera.lookAt(0, 1.2, 0);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = aspect > 1.5 ? 60 : 55;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

// Simple procedural tree
function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
        <meshStandardMaterial color="#5d3a1a" />
      </mesh>
      {/* Foliage layers */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[1.0, 1.5, 8]} />
        <meshStandardMaterial color="#1a5c1a" />
      </mesh>
      <mesh position={[0, 3.3, 0]} castShadow>
        <coneGeometry args={[0.7, 1.2, 8]} />
        <meshStandardMaterial color="#227722" />
      </mesh>
      <mesh position={[0, 3.9, 0]} castShadow>
        <coneGeometry args={[0.45, 0.9, 8]} />
        <meshStandardMaterial color="#2a8a2a" />
      </mesh>
    </group>
  );
}

// The Gremlin character - a little green creature
function GremlinModel({ alive, hp }: { alive: boolean; hp: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const bounceRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (alive) {
      bounceRef.current += delta * 3;
      groupRef.current.position.y = Math.sin(bounceRef.current) * 0.1 + 0.05;
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  const bodyColor = alive ? '#2ecc40' : '#666666';
  const eyeColor = alive ? '#ff4444' : '#333333';

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Body */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.4, 8, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Left ear */}
      <mesh position={[-0.3, 1.4, 0]} rotation={[0, 0, -0.5]} castShadow>
        <coneGeometry args={[0.1, 0.3, 6]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Right ear */}
      <mesh position={[0.3, 1.4, 0]} rotation={[0, 0, 0.5]} castShadow>
        <coneGeometry args={[0.1, 0.3, 6]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.12, 1.2, 0.25]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color={eyeColor} emissive={alive ? '#ff0000' : '#000'} emissiveIntensity={alive ? 0.5 : 0} />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.12, 1.2, 0.25]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color={eyeColor} emissive={alive ? '#ff0000' : '#000'} emissiveIntensity={alive ? 0.5 : 0} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.4, 0.5, 0]} rotation={[0, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.15, 0.1, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.2, 4, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.15, 0.1, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.2, 4, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
    </group>
  );
}

// Scattered rocks
function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#888877" roughness={0.9} />
    </mesh>
  );
}

// Mushrooms
function Mushroom({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.2, 6]} />
        <meshStandardMaterial color="#e8dcc8" />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.08, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#cc3333" />
      </mesh>
    </group>
  );
}

type GremlinSceneProps = {
  state: LobbyState | null;
};

export default function GremlinScene({ state }: GremlinSceneProps) {
  const gremlin = state?.players.find((p) => p.gremlin || p.boss);
  const gremlinAlive = gremlin ? gremlin.hp > 0 : true;
  const gremlinHp = gremlin?.hp ?? 5;

  // Fixed tree positions around the clearing
  const trees = useMemo(
    () => [
      [-4, 0, -3] as [number, number, number],
      [-3, 0, -5] as [number, number, number],
      [-5.5, 0, -1] as [number, number, number],
      [-2, 0, -6] as [number, number, number],
      [4, 0, -3] as [number, number, number],
      [3, 0, -5] as [number, number, number],
      [5.5, 0, -1] as [number, number, number],
      [2, 0, -6] as [number, number, number],
      [-5, 0, 2] as [number, number, number],
      [5, 0, 2] as [number, number, number],
      [-3.5, 0, 4] as [number, number, number],
      [3.5, 0, 4] as [number, number, number],
      [-6, 0, -4] as [number, number, number],
      [6, 0, -4] as [number, number, number],
      [0, 0, -7] as [number, number, number],
      [-1, 0, -8] as [number, number, number],
      [1.5, 0, -7.5] as [number, number, number],
    ],
    []
  );

  return (
    <>
      <ForestCamera />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow color="#ffffcc" />
      <pointLight position={[0, 3, 0]} intensity={0.4} color="#88ff88" />

      {/* Dark green forest sky */}
      <color attach="background" args={['#0a2a0a']} />
      <fog attach="fog" args={['#0a2a0a', 8, 20]} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>

      {/* Clearing patch (lighter ground) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color="#2a4a2a" />
      </mesh>

      {/* Trees */}
      {trees.map((pos, i) => (
        <Tree key={i} position={pos} />
      ))}

      {/* Rocks */}
      <Rock position={[-1.5, 0.1, 1.5]} scale={0.8} />
      <Rock position={[2, 0.15, -1]} scale={1.2} />
      <Rock position={[-0.5, 0.1, -2.5]} scale={0.6} />

      {/* Mushrooms */}
      <Mushroom position={[-1, 0, 0.5]} />
      <Mushroom position={[1.2, 0, -0.3]} />
      <Mushroom position={[0.3, 0, 1.8]} />

      {/* The Gremlin */}
      <GremlinModel alive={gremlinAlive} hp={gremlinHp} />

      <Environment preset="forest" />
    </>
  );
}
