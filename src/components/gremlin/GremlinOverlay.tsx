'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getState,
  submitChoice,
  getPlayerMessages,
} from '@/lib/api';
import type { LobbyState } from '@/types/game';

const btn = 'px-4 py-2 rounded-lg border-2 border-black font-bold cursor-pointer transition-colors';

type GremlinOverlayProps = {
  lobbyId: string;
  onStateChange?: (state: LobbyState | null) => void;
};

export default function GremlinOverlay({ lobbyId, onStateChange }: GremlinOverlayProps) {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [state, setState] = useState<LobbyState | null>(null);
  const [messages, setMessages] = useState<string[][]>([]);
  const [action, setAction] = useState('');
  const [resource, setResource] = useState('');
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const lastMessagesFlat = useRef('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPlayerName(localStorage.getItem('playerName') || '');
    }
  }, []);

  // Poll state
  useEffect(() => {
    if (!lobbyId) return;
    const fetchState = async () => {
      try {
        const json = await getState(lobbyId);
        setState(json);
      } catch (e) {
        console.warn('get_state failed', e);
      }
    };
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [lobbyId]);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Round timer
  useEffect(() => {
    if (!state?.round_end_time) {
      setSecondsLeft(null);
      return;
    }
    const endTime = new Date(state.round_end_time).getTime() / 1000;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor(endTime - Date.now() / 1000));
      setSecondsLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [state?.round_end_time]);

  // Reset choices on new round
  useEffect(() => {
    setAction('');
    setResource('');
  }, [state?.round]);

  // Fetch messages
  useEffect(() => {
    if (!lobbyId || !playerName) return;
    getPlayerMessages(lobbyId, playerName)
      .then((json) => {
        const newMsgs = json.messages ?? [];
        const newFlat = newMsgs.flat().join('\n');
        if (newFlat !== lastMessagesFlat.current) {
          lastMessagesFlat.current = newFlat;
          setMessages(newMsgs);
        }
      })
      .catch(() => {});
  }, [state?.round, lobbyId, playerName, state?.deny_target]);

  const gremlin = state?.players.find((p) => p.boss);
  const myPlayer = state?.players.find((p) => p.name === playerName);
  const isAlive = (myPlayer?.hp ?? 0) > 0;
  const gameOver = state?.gameover ?? false;
  const gameStarted = (state?.round ?? 0) > 0;

  const handleResource = async (resId: string) => {
    try {
      await submitChoice(lobbyId, { player: playerName, resource: resId, action: '' });
      setResource(resId);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'API error');
    }
  };

  const handleAction = async (act: string) => {
    setAction(act);
    if (act === 'attack' && gremlin) {
      try {
        await submitChoice(lobbyId, { player: playerName, action: 'attack', target: gremlin.name, resource: '' });
      } catch (e) {
        alert(e instanceof Error ? e.message : 'API error');
      }
    } else {
      try {
        await submitChoice(lobbyId, { player: playerName, action: act, resource: '' });
      } catch (e) {
        alert(e instanceof Error ? e.message : 'API error');
      }
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-green-300 text-lg">Entering the forest...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-end justify-center pb-4 sm:pb-8 pointer-events-none z-10">
      {/* Back button */}
      <div className="absolute top-4 left-4 pointer-events-auto z-20">
        <Link href="/" className="text-green-300 hover:underline font-medium drop-shadow-md">
          ← Flee the forest
        </Link>
      </div>

      {/* Gremlin HP bar at top */}
      {gremlin && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto z-20">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-6 py-3 text-center border border-green-500/30">
            <p className="text-green-400 font-bold text-lg">{gremlin.name}</p>
            <p className="text-gray-300 text-sm">{gremlin.title}</p>
            <div className="mt-2 w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(0, (gremlin.hp / 5) * 100)}%` }}
              />
            </div>
            <p className="text-green-300 text-sm mt-1">
              {Math.max(0, gremlin.hp)} / 5 HP
            </p>
          </div>
        </div>
      )}

      {/* Main combat panel at bottom */}
      <div className="pointer-events-auto w-full max-w-2xl mx-4">
        <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-green-500/30 p-4 sm:p-6 text-white">
          {/* Round info */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-green-400 font-semibold">Round {state.round}</span>
            {secondsLeft !== null && secondsLeft <= 20 && !gameOver && (
              <span className={`font-semibold ${secondsLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                {secondsLeft}s
              </span>
            )}
          </div>

          {/* Player stats */}
          {myPlayer && !myPlayer.spectator && (
            <div className="flex gap-4 mb-4 text-sm flex-wrap">
              <span>❤ <span className="font-semibold text-red-400">{myPlayer.hp}</span></span>
              <span>💰 <span className="font-semibold text-yellow-400">{myPlayer.coins}</span></span>
              <span>⚔ <span className="font-semibold text-blue-400">{myPlayer.attackDamage}</span></span>
            </div>
          )}

          {/* Combat controls */}
          {!gameOver && isAlive && gameStarted && (
            <>
              <div className="mb-3">
                <p className="text-green-300 text-xs font-semibold mb-2 uppercase tracking-wide">Resource</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'gain_hp', label: 'Get ❤' },
                    { id: 'gain_coin', label: 'Get 💰' },
                    { id: 'gain_attack', label: 'Buy ⚔' },
                  ].map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => handleResource(res.id)}
                      className={`${btn} text-sm ${resource === res.id ? 'bg-green-600 text-white border-green-400' : 'bg-gray-700 text-gray-200 border-gray-500'}`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <p className="text-green-300 text-xs font-semibold mb-2 uppercase tracking-wide">Action</p>
                <div className="flex flex-wrap gap-2">
                  {['attack', 'defend', 'raid'].map((act) => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => handleAction(act)}
                      className={`${btn} text-sm ${action === act ? 'bg-green-600 text-white border-green-400' : 'bg-gray-700 text-gray-200 border-gray-500'}`}
                    >
                      {act === 'attack' ? '⚔ ATTACK' : act === 'defend' ? '🛡 DEFEND' : '🏴 RAID'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="mt-3 max-h-32 overflow-y-auto border-t border-green-500/20 pt-3">
              <ul className="text-sm text-gray-300 space-y-1">
                {messages.map((m, i) => (
                  <li key={i} className="text-green-200">{Array.isArray(m) ? m.join(' ') : m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Game Over */}
          {gameOver && (
            <div className="mt-4 text-center">
              <p className="text-xl font-bold mb-3">
                {state.winner === playerName ? (
                  <span className="text-green-400">You defeated the Gremlin!</span>
                ) : gremlin && state.winner === gremlin.name ? (
                  <span className="text-red-400">The Gremlin got you...</span>
                ) : (
                  <span className="text-yellow-400">Game Over! {state.winner} wins!</span>
                )}
              </p>
              <Link
                href="/"
                className="text-green-400 hover:underline font-medium"
              >
                ← Return to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
