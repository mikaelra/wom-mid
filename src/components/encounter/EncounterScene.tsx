'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { Environment, useGLTF, Html } from '@react-three/drei';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import type { LobbyState } from '@/types/game';

// Positions: enemies on far side (-Z), player on near side (+Z)
const ENEMY_LEFT_POS: [number, number, number] = [-0.7, 0.4, -1.15];
const ENEMY_RIGHT_POS: [number, number, number] = [0.7, 0.4, -1.15];
const CHERUB_POS: [number, number, number] = [0, 0.4, 1.15];

function ForestCamera() {
  const { camera, size } = useThree();
  const pos = useRef(new THREE.Vector3(0, 8, 12));

  useFrame(() => {
    const aspect = size.width / size.height;
    const targetZ = aspect > 1.2 ? 5.5 : 6.5;
    const target = new THREE.Vector3(0, 2.0, targetZ);
    pos.current.lerp(target, 0.03);
    camera.position.copy(pos.current);
    camera.lookAt(0, 0.9, 0);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = aspect > 1.5 ? 60 : 55;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
        <meshStandardMaterial color="#5d3a1a" />
      </mesh>
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

function BattleTable() {
  return (
    <group>
      <mesh position={[0, 0.84, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.08, 24]} />
        <meshStandardMaterial color="#6b3a1f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#5a3018" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.06, 8]} />
        <meshStandardMaterial color="#5a3018" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Stump({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.4, 10]} />
        <meshStandardMaterial color="#5d3a1a" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.41, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.02, 10]} />
        <meshStandardMaterial color="#4a2e14" roughness={0.9} />
      </mesh>
    </group>
  );
}

function CherubModel({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const { scene } = useGLTF('/models/cherub-v01.glb');
  const clone = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef<THREE.Group>(null!);
  const bobRef = useRef(0);

  useEffect(() => {
    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [clone]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    bobRef.current += delta * 1.5;
    groupRef.current.position.y = position[1] + Math.sin(bobRef.current) * 0.05;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive object={clone} scale={0.5} />
    </group>
  );
}

// Gremlin — same as original
function GremlinModel({
  alive,
  position,
}: {
  alive: boolean;
  position: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const bobRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (alive) {
      bobRef.current += delta * 2.5;
      groupRef.current.position.y = position[1] + Math.sin(bobRef.current) * 0.06 + 0.05;
    }
  });

  const bodyColor = alive ? '#2ecc40' : '#666666';
  const eyeColor = alive ? '#ff4444' : '#333333';

  return (
    <group ref={groupRef} position={position} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.35, 8, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[-0.25, 1.3, 0]} rotation={[0, 0, -0.5]} castShadow>
        <coneGeometry args={[0.08, 0.25, 6]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.25, 1.3, 0]} rotation={[0, 0, 0.5]} castShadow>
        <coneGeometry args={[0.08, 0.25, 6]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[-0.1, 1.1, 0.22]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color={eyeColor} emissive={alive ? '#ff0000' : '#000'} emissiveIntensity={alive ? 0.5 : 0} />
      </mesh>
      <mesh position={[0.1, 1.1, 0.22]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color={eyeColor} emissive={alive ? '#ff0000' : '#000'} emissiveIntensity={alive ? 0.5 : 0} />
      </mesh>
      <mesh position={[-0.35, 0.45, 0]} rotation={[0, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.07, 0.25, 4, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.35, 0.45, 0]} rotation={[0, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.07, 0.25, 4, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[-0.12, 0.08, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.15, 4, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.12, 0.08, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.15, 4, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
    </group>
  );
}

// Raskibask — raccoon-like creature
function RaskibaskModel({
  alive,
  position,
}: {
  alive: boolean;
  position: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const bobRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (alive) {
      bobRef.current += delta * 2.0;
      groupRef.current.position.y = position[1] + Math.sin(bobRef.current) * 0.04 + 0.03;
    }
  });

  const furColor = alive ? '#888888' : '#555555';
  const darkFur = alive ? '#444444' : '#333333';
  const noseColor = alive ? '#222222' : '#333333';
  const eyeColor = alive ? '#111111' : '#333333';
  const maskColor = alive ? '#222222' : '#333333';

  return (
    <group ref={groupRef} position={position} rotation={[0, Math.PI, 0]}>
      {/* Body — chubby oval */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.3, 8, 16]} />
        <meshStandardMaterial color={furColor} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={furColor} />
      </mesh>
      {/* Raccoon mask (dark band across eyes) */}
      <mesh position={[0, 0.93, 0.15]}>
        <boxGeometry args={[0.35, 0.1, 0.1]} />
        <meshStandardMaterial color={maskColor} />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.09, 0.93, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={eyeColor} emissive={alive ? '#222' : '#000'} emissiveIntensity={alive ? 0.3 : 0} />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.09, 0.93, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={eyeColor} emissive={alive ? '#222' : '#000'} emissiveIntensity={alive ? 0.3 : 0} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.85, 0.2]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color={noseColor} />
      </mesh>
      {/* Left ear */}
      <mesh position={[-0.17, 1.1, 0]} castShadow>
        <coneGeometry args={[0.07, 0.12, 6]} />
        <meshStandardMaterial color={furColor} />
      </mesh>
      {/* Right ear */}
      <mesh position={[0.17, 1.1, 0]} castShadow>
        <coneGeometry args={[0.07, 0.12, 6]} />
        <meshStandardMaterial color={furColor} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.3, 0.35, 0]} rotation={[0, 0, -0.4]} castShadow>
        <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
        <meshStandardMaterial color={darkFur} />
      </mesh>
      <mesh position={[0.3, 0.35, 0]} rotation={[0, 0, 0.4]} castShadow>
        <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
        <meshStandardMaterial color={darkFur} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.1, 0.05, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.12, 4, 8]} />
        <meshStandardMaterial color={darkFur} />
      </mesh>
      <mesh position={[0.1, 0.05, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.12, 4, 8]} />
        <meshStandardMaterial color={darkFur} />
      </mesh>
      {/* Tail — striped bushy tail */}
      <mesh position={[0, 0.35, -0.3]} rotation={[0.8, 0, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
        <meshStandardMaterial color={furColor} />
      </mesh>
      <mesh position={[0, 0.5, -0.42]} rotation={[0.6, 0, 0]}>
        <capsuleGeometry args={[0.07, 0.08, 4, 8]} />
        <meshStandardMaterial color={darkFur} />
      </mesh>
    </group>
  );
}

// Thief — small white man in black robes, leather face covering
function ThiefModel({
  alive,
  position,
}: {
  alive: boolean;
  position: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const bobRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (alive) {
      bobRef.current += delta * 1.8;
      groupRef.current.position.y = position[1] + Math.sin(bobRef.current) * 0.03;
    }
  });

  const robeColor = alive ? '#1a1a1a' : '#444444';
  const skinColor = alive ? '#f5deb3' : '#888888';
  const leatherColor = alive ? '#5c3a1e' : '#444444';

  return (
    <group ref={groupRef} position={position} rotation={[0, Math.PI, 0]}>
      {/* Body/Robe — tall dark cloak */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.5, 8, 16]} />
        <meshStandardMaterial color={robeColor} />
      </mesh>
      {/* Robe bottom flare */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <coneGeometry args={[0.35, 0.4, 8]} />
        <meshStandardMaterial color={robeColor} />
      </mesh>
      {/* Head (small, mostly covered) */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      {/* Hood */}
      <mesh position={[0, 1.25, -0.05]} castShadow>
        <sphereGeometry args={[0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
        <meshStandardMaterial color={robeColor} />
      </mesh>
      {/* Leather face mask */}
      <mesh position={[0, 1.1, 0.15]}>
        <boxGeometry args={[0.22, 0.12, 0.08]} />
        <meshStandardMaterial color={leatherColor} roughness={0.9} />
      </mesh>
      {/* Eyes peeking above mask */}
      <mesh position={[-0.07, 1.17, 0.18]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={alive ? '#cccccc' : '#555'} emissive={alive ? '#888' : '#000'} emissiveIntensity={alive ? 0.3 : 0} />
      </mesh>
      <mesh position={[0.07, 1.17, 0.18]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={alive ? '#cccccc' : '#555'} emissive={alive ? '#888' : '#000'} emissiveIntensity={alive ? 0.3 : 0} />
      </mesh>
      {/* Arms (robed) */}
      <mesh position={[-0.35, 0.55, 0]} rotation={[0, 0, -0.2]} castShadow>
        <capsuleGeometry args={[0.07, 0.3, 4, 8]} />
        <meshStandardMaterial color={robeColor} />
      </mesh>
      <mesh position={[0.35, 0.55, 0]} rotation={[0, 0, 0.2]} castShadow>
        <capsuleGeometry args={[0.07, 0.3, 4, 8]} />
        <meshStandardMaterial color={robeColor} />
      </mesh>
      {/* Legs (hidden by robe, small peeks) */}
      <mesh position={[-0.1, 0.02, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.08, 4, 8]} />
        <meshStandardMaterial color={robeColor} />
      </mesh>
      <mesh position={[0.1, 0.02, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.08, 4, 8]} />
        <meshStandardMaterial color={robeColor} />
      </mesh>
    </group>
  );
}

function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#888877" roughness={0.9} />
    </mesh>
  );
}

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

// 3D wooden signpost that appears after victory
function WoodenSignpost({
  position,
  text,
  visible,
}: {
  position: [number, number, number];
  text: string;
  visible: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const bobRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !visible) return;
    bobRef.current += delta * 1.2;
    groupRef.current.position.y = position[1] + Math.sin(bobRef.current) * 0.04;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Pole */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 1.2, 8]} />
        <meshStandardMaterial color="#5d3a1a" roughness={0.9} />
      </mesh>
      {/* Sign board */}
      <mesh position={[0, 1.35, 0.02]} castShadow>
        <boxGeometry args={[1.2, 0.5, 0.08]} />
        <meshStandardMaterial color="#8B6914" roughness={0.85} />
      </mesh>
      {/* Board edge / frame */}
      <mesh position={[0, 1.35, 0.065]}>
        <boxGeometry args={[1.25, 0.55, 0.01]} />
        <meshStandardMaterial color="#6b4f12" roughness={0.9} />
      </mesh>
      {/* Wood grain lines */}
      <mesh position={[0, 1.25, 0.07]}>
        <boxGeometry args={[1.1, 0.01, 0.005]} />
        <meshStandardMaterial color="#7a5a10" />
      </mesh>
      <mesh position={[0, 1.45, 0.07]}>
        <boxGeometry args={[1.1, 0.01, 0.005]} />
        <meshStandardMaterial color="#7a5a10" />
      </mesh>
      {/* Text label using Html */}
      <Html position={[0, 1.35, 0.1]} center transform occlude={false}>
        <div style={{
          fontFamily: 'serif',
          fontWeight: 'bold',
          fontSize: '18px',
          color: '#FFD700',
          textShadow: '1px 1px 2px #000, -1px -1px 2px #000',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          {text}
        </div>
      </Html>
    </group>
  );
}

type EncounterSceneProps = {
  state: LobbyState | null;
};

export default function EncounterScene({ state }: EncounterSceneProps) {
  const isThiefEncounter = state?.thief_encounter;

  // Find enemies
  const gremlin = state?.players.find((p) => p.gremlin);
  const raskibask = state?.players.find((p) => p.raskibask);
  const thief = state?.players.find((p) => p.thief);

  const gremlinAlive = gremlin ? gremlin.hp > 0 : true;
  const raskibaskAlive = raskibask ? raskibask.hp > 0 : false;
  const thiefAlive = thief ? thief.hp > 0 : false;
  const playerWon = !!(state?.gameover && (state?.winner === 'Players' || (state?.winner && !state.players.find(p => p.bot && p.name === state.winner))));

  const trees = useMemo(
    () =>
      [
        [-4, 0, -3], [-3, 0, -5], [-5.5, 0, -1], [-2, 0, -6],
        [4, 0, -3], [3, 0, -5], [5.5, 0, -1], [2, 0, -6],
        [-5, 0, 2], [5, 0, 2], [-3.5, 0, 4], [3.5, 0, 4],
        [-6, 0, -4], [6, 0, -4], [0, 0, -7], [-1, 0, -8], [1.5, 0, -7.5],
      ] as [number, number, number][],
    []
  );

  return (
    <>
      <ForestCamera />

      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow color="#ffffcc" />
      <pointLight position={[0, 2, 0]} intensity={0.5} color="#88ff88" />

      <color attach="background" args={['#0a2a0a']} />
      <fog attach="fog" args={['#0a2a0a', 8, 20]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color="#2a4a2a" />
      </mesh>

      {trees.map((pos, i) => (
        <Tree key={i} position={pos} />
      ))}

      <Rock position={[-1.5, 0.1, 1.5]} scale={0.8} />
      <Rock position={[2, 0.15, -1]} scale={1.2} />
      <Rock position={[-0.5, 0.1, -2.5]} scale={0.6} />

      <Mushroom position={[-1, 0, 0.5]} />
      <Mushroom position={[1.2, 0, -0.3]} />
      <Mushroom position={[0.3, 0, 1.8]} />

      <BattleTable />

      {/* Three stumps: two for enemies, one for player */}
      <Stump position={[-0.7, 0, -1.15]} />
      <Stump position={[0.7, 0, -1.15]} />
      <Stump position={[0, 0, 1.15]} />

      {/* Enemies on the far side */}
      {isThiefEncounter ? (
        <>
          <ThiefModel alive={thiefAlive} position={ENEMY_LEFT_POS} />
          <GremlinModel alive={gremlinAlive} position={ENEMY_RIGHT_POS} />
        </>
      ) : (
        <>
          <GremlinModel alive={gremlinAlive} position={ENEMY_LEFT_POS} />
          <RaskibaskModel alive={raskibaskAlive} position={ENEMY_RIGHT_POS} />
        </>
      )}

      {/* Player cherub on the near side */}
      <CherubModel position={CHERUB_POS} rotation={[0, Math.PI, 0]} />

      {/* Wooden signpost after forest encounter victory (not shown for thief encounter) */}
      {!isThiefEncounter && (
        <WoodenSignpost position={[2, 0, 0.5]} text="THEIF!" visible={playerWon} />
      )}

      <Environment preset="forest" />
    </>
  );
}

useGLTF.preload('/models/cherub-v01.glb');
