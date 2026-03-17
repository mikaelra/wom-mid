'use client';

import Link from 'next/link';
import SceneOverlay, { type SceneOverlayConfig, type GameOverRenderOpts } from '@/components/SceneOverlay';
import type { LobbyState } from '@/types/game';

type GremlinOverlayProps = {
  lobbyId: string;
  onStateChange?: (state: LobbyState | null) => void;
};

function renderGameOver({ state, playerName, enemy }: GameOverRenderOpts) {
  return (
    <div className="mt-3 text-center">
      <p className="text-xl font-bold mb-2">
        {state.winner === playerName ? (
          <span className="text-green-400">You defeated the Gremlin!</span>
        ) : enemy && state.winner === enemy.name ? (
          <span className="text-red-400">The Gremlin got you...</span>
        ) : (
          <span className="text-yellow-400">Game Over! {state.winner} wins!</span>
        )}
      </p>
      <Link href="/" className="text-green-400 hover:underline font-medium">
        ← Return to Home
      </Link>
    </div>
  );
}

const gremlinConfig: SceneOverlayConfig = {
  theme: {
    accentColorClass: 'text-green-400',
    panelBorderClass: 'border-green-500/30',
    msgBorderClass: 'border-green-500/20',
    msgTextClass: 'text-green-200',
    showMoreClass: 'text-green-500 hover:text-green-300',
    backLinkClass: 'text-green-300',
    enemyBorderClass: 'border-green-500/30',
    enemyNameClass: 'text-green-400',
    enemyHpBarClass: 'bg-green-500',
    enemyHpTextClass: 'text-green-300',
    loadingTextClass: 'text-green-300',
    loadingBgClass: '',
  },
  backLabel: '← Flee the forest',
  raidLabel: 'The Well',
  loadingText: 'Entering the forest...',
  enemyMaxHp: 5,
  showEnemyAlways: true,
  renderGameOver,
  renderExtra: ({ gameOver, btn }) =>
    gameOver ? (
      <div
        className="absolute pointer-events-auto"
        style={{ top: '54%', left: '78%', transform: 'translate(-50%, -50%)' }}
      >
        <Link
          href="/"
          className={`${btn} text-sm backdrop-blur-sm shadow-lg bg-amber-900/80 text-amber-200 border-amber-700 hover:bg-amber-800/90`}
        >
          ⚔ More monsters
        </Link>
      </div>
    ) : null,
};

export default function GremlinOverlay({ lobbyId, onStateChange }: GremlinOverlayProps) {
  return <SceneOverlay lobbyId={lobbyId} onStateChange={onStateChange} config={gremlinConfig} />;
}
