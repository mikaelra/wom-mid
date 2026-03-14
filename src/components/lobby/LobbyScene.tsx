'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { Html, Environment, useGLTF } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import Mountain from '@/components/mountain';
import Table from '@/components/Table';
import PlayerV1 from '@/components/Playerv1';
import {
  TABLE_POSITION,
  SCENE_CENTER,
  PLAYER_POSITIONS,
  getCameraTargetPosition,
  getResponsiveFov,
} from '@/lib/sceneConstants';
import type { LobbyState } from '@/types/game';


function CameraFlyIn() {
  const { camera, size } = useThree();
  const currentPosition = useRef(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z));

  useFrame(() => {
    const [x, y, z] = getCameraTargetPosition(size.width, size.height);
    const target = new THREE.Vector3(x, y, z);
    currentPosition.current.lerp(target, 0.025);
    camera.position.copy(currentPosition.current);
    camera.lookAt(...SCENE_CENTER);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = getResponsiveFov(size.width, size.height);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function PlayerWithName({
  name,
  position,
  rotation,
  isAnimating,
  isDead,
  isWinner,
}: {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  isAnimating: boolean;
  isDead?: boolean;
  isWinner?: boolean;
}) {
  return (
    <group position={position} rotation={rotation}>
      <PlayerV1
        scale={0.15}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        isAnimating={isAnimating}
      />
      <Html
        position={[0, 0.5, 0]}
        center
        distanceFactor={3}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          fontSize: '14px',
          fontWeight: 'bold',
          color: isDead ? '#888' : isWinner ? 'gold' : 'white',
          textShadow: '0 0 4px rgba(0,0,0,0.8)',
          padding: '2px 6px',
          background: 'rgba(0,0,0,0.6)',
          borderRadius: '4px',
        }}
      >
        {name}
        {isWinner && ' 👑'}
        {isDead && ' ☠️'}
      </Html>
    </group>
  );
}


const LOST_SOUL_POSITIONS: [number, number, number][] = [
  [-0.7, 4.2, -0.7],
  [0.7, 4.2, -0.7],
  [-0.7, 4.2, 0.7],
  [0.7, 4.2, 0.7],
];

function LostSoulModel({
  name,
  position,
}: {
  name: string;
  position: [number, number, number];
}) {
  const { scene } = useGLTF('/models/ghost.glb');
  const sceneClone = useMemo(() => scene.clone(), [scene]);
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.8 + position[0]) * 0.1;
    }
  });

  return (
    <group ref={ref} position={position}>
      <primitive object={sceneClone} scale={0.4} />
      <Html
        position={[0, 0.6, 0]}
        center
        distanceFactor={3}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#a78bfa',
          textShadow: '0 0 6px rgba(100,0,200,0.8)',
          padding: '2px 6px',
          background: 'rgba(0,0,0,0.6)',
          borderRadius: '4px',
        }}
      >
        {name}
      </Html>
    </group>
  );
}

useGLTF.preload('/models/ghost.glb');

type LobbySceneProps = {
  state: LobbyState | null;
  playerName: string;
};

export default function LobbyScene({ state, playerName }: LobbySceneProps) {
  const allPlayers = state?.players ?? [];
  const lostSouls = allPlayers.filter((p) => p.lost_soul);
  const players = allPlayers.filter((p) => !p.lost_soul).slice(0, PLAYER_POSITIONS.length);
  const winner = state?.winner ?? state?.raidwinner ?? null;
  return (
    <>
      <CameraFlyIn />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} castShadow />
      <color attach="background" args={['#87ceeb']} />

      <Mountain scale={150} position={[40, -282, 62]} />
      <Table position={TABLE_POSITION} scale={1.2} />

      {players.map((player, i) => {
        const slot = PLAYER_POSITIONS[i];
        if (!slot) return null;
        const { position, rotation } = slot;
        const isDead = (player.hp ?? 0) <= 0;
        const isWinner = winner === player.name;
        return (
          <PlayerWithName
            key={player.name}
            name={player.name}
            position={position}
            rotation={rotation}
            isAnimating={true}
            isDead={isDead}
            isWinner={!!isWinner}
          />
        );
      })}

      {lostSouls.map((soul, i) => {
        const pos = LOST_SOUL_POSITIONS[i % LOST_SOUL_POSITIONS.length];
        return (
          <LostSoulModel
            key={soul.name}
            name={soul.name}
            position={pos}
          />
        );
      })}

      <Environment preset="sunset" />
    </>
  );
}
