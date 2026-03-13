'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import EncounterOverlay from '@/components/encounter/EncounterOverlay';

const EncounterScene = dynamic(() => import('@/components/encounter/EncounterScene'), { ssr: false });

export default function EncounterPage() {
  const params = useParams();
  const lobbyId = params?.lobbyId as string | undefined;
  const [lobbyState, setLobbyState] = useState<import('@/types/game').LobbyState | null>(null);

  if (!lobbyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-green-400">Invalid lobby.</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#0a2a0a' }}>
      <Canvas
        camera={{ position: [0, 8, 12], fov: 55 }}
        shadows
        style={{ position: 'absolute', inset: 0 }}
      >
        <EncounterScene state={lobbyState} />
      </Canvas>
      <EncounterOverlay lobbyId={lobbyId} onStateChange={setLobbyState} />
    </div>
  );
}
