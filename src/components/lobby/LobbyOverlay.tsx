'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getState,
  getNextRaidTime,
  startGame,
  addDummy,
  kickPlayer,
  submitChoice,
  submitDenyTarget,
  getPlayerMessages,
  requestReplay,
} from '@/lib/api';
import type { LobbyState } from '@/types/game';
import FloatingMessage from './FloatingMessage';

const btn = 'px-4 py-2 rounded-lg border-2 border-black font-bold cursor-pointer transition-colors';

type LobbyOverlayProps = {
  lobbyId: string;
  onStateChange?: (state: LobbyState | null) => void;
};

export default function LobbyOverlay({ lobbyId, onStateChange }: LobbyOverlayProps) {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [state, setState] = useState<LobbyState | null>(null);
  const [messages, setMessages] = useState<string[][]>([]);
  const [action, setAction] = useState('');
  const [resource, setResource] = useState('');
  const [target, setTarget] = useState('');
  const [denyTarget, setDenyTarget] = useState('');
  const [replayVoted, setReplayVoted] = useState(false);
  const [replayLoading, setReplayLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [floatingMessages, setFloatingMessages] = useState<string[]>([]);
  const [nextRaidTime, setNextRaidTime] = useState<number | null>(null);
  const [raidMins, setRaidMins] = useState<number | null>(null);
  const [raidSecs, setRaidSecs] = useState<number | null>(null);
  const lastMessagesFlat = useRef('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPlayerName(localStorage.getItem('playerName') || '');
    }
  }, []);

  useEffect(() => {
    setState(null);
    setReplayVoted(false);
    setFloatingMessages([]);
    setMessages([]);
  }, [lobbyId]);

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

  const gameOver = state?.gameover ?? false;
  useEffect(() => {
    if (gameOver && state?.next_lobby_id && state.next_lobby_id !== lobbyId) {
      router.replace(`/lobby/${state.next_lobby_id}`);
    }
  }, [gameOver, state?.next_lobby_id, lobbyId, router]);

  useEffect(() => {
    setDenyTarget('');
    setTarget('');
    setAction('');
    setResource('');
  }, [state?.round]);

  useEffect(() => {
    if (!lobbyId || !playerName) return;
    getPlayerMessages(lobbyId, playerName)
      .then((json) => {
        const newMsgs = json.messages ?? [];
        const newFlat = newMsgs.flat().join('\n');
        if (newFlat !== lastMessagesFlat.current) {
          lastMessagesFlat.current = newFlat;
          setFloatingMessages((prev) => [...prev, newFlat]);
          setTimeout(() => setMessages(newMsgs), 2500);
        }
      })
      .catch(() => {});
  }, [state?.round, lobbyId, playerName, state?.deny_target]);

  const isAlive = (state?.players.find((p) => p.name === playerName)?.hp ?? 0) > 0;
  useEffect(() => {
    if (!isAlive) return;
    getNextRaidTime()
      .then((json) => setNextRaidTime(json.start_time))
      .catch(() => setNextRaidTime(null));
  }, [isAlive]);

  useEffect(() => {
    if (nextRaidTime == null) return;
    const nextRT = new Date(nextRaidTime);
    const interval = setInterval(() => {
      const diff = Math.floor((nextRT.getTime() - Date.now()) / 1000);
      setRaidSecs(Math.floor(diff % 60));
      setRaidMins(Math.floor(diff / 60));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextRaidTime]);

  const myPlayer = state?.players.find((p) => p.name === playerName);
  const otherPlayers = state?.players.filter((p) => p.name !== playerName && p.hp > 0 && !p.spectator) ?? [];
  const isAdmin = myPlayer?.admin ?? false;
  const boss = state?.players.find((p) => p.boss);
  const gameStarted = (state?.round ?? 0) > 0;
  const deniedTarget = state?.deny_target;
  const isDenied = playerName === deniedTarget;
  const isChoosingDeny = state?.pending_deny === playerName;
  const eligibleTargets = state?.players.filter((p) => p.name !== playerName && p.hp > 0) ?? [];

  const handleStartGame = async () => {
    try {
      await startGame(lobbyId, playerName);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to start game');
    }
  };

  const handleAddDummy = async () => {
    try {
      await addDummy(lobbyId, playerName);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to add bot');
    }
  };

  const handleKick = async (targetName: string) => {
    try {
      await kickPlayer(lobbyId, playerName, targetName);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to kick');
    }
  };

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
    if (act !== 'attack') {
      try {
        await submitChoice(lobbyId, { player: playerName, action: act, resource: '' });
      } catch (e) {
        alert(e instanceof Error ? e.message : 'API error');
      }
    }
  };

  const handleAttackTarget = async (chosen: string) => {
    setTarget(chosen);
    try {
      await submitChoice(lobbyId, { player: playerName, action: 'attack', target: chosen, resource: '' });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'API error');
    }
  };

  const handleDeny = async () => {
    try {
      await submitDenyTarget(lobbyId, playerName, denyTarget);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to submit deny');
    }
  };

  const handleReplay = async () => {
    setReplayLoading(true);
    try {
      const data = await requestReplay(lobbyId, playerName);
      setReplayVoted(true);
      if (data.next_lobby_id) {
        setState((s) => (s ? { ...s, next_lobby_id: data.next_lobby_id } : s));
      } else {
        const updated = await getState(lobbyId);
        setState(updated);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to vote for replay');
    } finally {
      setReplayLoading(false);
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700 text-lg">Loading lobby…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="absolute top-4 left-4 z-20">
        <Link href="/" className="text-blue-600 hover:underline font-medium">
          ← Back to Home
        </Link>
      </div>
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center">
        <div className="w-full max-w-3xl flex flex-col items-center justify-center rounded-2xl shadow-xl bg-white/80 backdrop-blur-sm transition-all duration-300 p-6 text-gray-900">
          {state.boss_fight && boss && (
            <div className="bg-red-200 p-4 rounded mb-4 w-full text-center">
              <h2 className="text-2xl font-bold">{boss.name}</h2>
              <p className="text-gray-500">{boss.title}</p>
              <p>HP: {boss.hp}</p>
              {!gameStarted && raidMins != null && raidSecs != null && (
                <p className="text-gray-500">
                  Boss-fight starts in {raidMins}m {raidSecs}s
                </p>
              )}
            </div>
          )}

          <h2 className="text-3xl font-extrabold mt-6 mb-4 tracking-tight">Lobby ID: {lobbyId}</h2>
          <p className="mb-3 text-lg text-gray-600">Round: {state.round ?? '?'}</p>
          <p className="mb-6 text-lg text-gray-600">Your Name: {playerName}</p>

          <div className="w-full mb-6 bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-xl text-gray-800 mb-4">Players in Lobby</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              {state.players.map((p) => (
                <li key={p.name} className="py-1 flex items-center gap-2 flex-wrap">
                  {p.hp <= 0 && <span className="text-red-500">☠️</span>}
                  {(state.winner === p.name || (!state.winner && state.raidwinner === p.name)) && (
                    <span className="text-yellow-500">👑</span>
                  )}
                  {p.spectator && <span className="text-yellow-500">👁</span>}
                  <span className="font-medium">{p.name}</span>
                  {isAdmin && p.name !== playerName && p.hp > 0 && state.round === 0 && (
                    <span
                      className="ml-2 text-red-500 text-sm cursor-pointer"
                      title="Kick player"
                      onClick={() => handleKick(p.name)}
                    >
                      ❌
                    </span>
                  )}
                  {state.readyPlayers?.includes(p.name) && <span className="text-green-500">✅</span>}
                  {p.idle_rounds >= 2 && <span className="text-gray-400">👻</span>}
                </li>
              ))}
            </ul>
          </div>

          {isAdmin && state.round === 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                type="button"
                onClick={handleStartGame}
                className={`${btn} bg-amber-600 text-white border-amber-700`}
              >
                Start Game
              </button>
              <button
                type="button"
                onClick={handleAddDummy}
                className={`${btn} bg-gray-600 text-white`}
              >
                Add Random Bot
              </button>
            </div>
          )}

          {floatingMessages.map((msg, idx) => (
            <FloatingMessage
              key={idx}
              message={msg}
              onDone={() => setFloatingMessages((prev) => prev.filter((_, i) => i !== idx))}
            />
          ))}

          {!myPlayer?.spectator && (
            <div className="w-full mb-6 bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-xl text-gray-800 mb-4">Your Stats</h3>
              <p className="text-gray-700 flex gap-4 flex-wrap">
                <span>❤ <span className="font-semibold text-red-500">{myPlayer?.hp}</span></span>
                <span>💰 <span className="font-semibold text-yellow-600">{myPlayer?.coins}</span></span>
                <span>⚔ <span className="font-semibold text-blue-600">{myPlayer?.attackDamage}</span></span>
              </p>
            </div>
          )}

          {!gameOver && !isDenied && isAlive && state.round !== 0 && !myPlayer?.spectator && (
            <div className="w-full mb-6 bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-lg text-gray-800 mb-3">Choose Resource</h4>
              <div className="flex flex-wrap gap-3 mb-4">
                {[
                  { id: 'gain_hp', label: 'Get ❤' },
                  { id: 'gain_coin', label: 'Get 💰' },
                  { id: 'gain_attack', label: 'Buy ⚔' },
                ].map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => handleResource(res.id)}
                    className={`${btn} ${resource === res.id ? 'bg-red-600 text-white' : 'bg-gray-200 text-black'}`}
                  >
                    {res.label}
                  </button>
                ))}
              </div>
              <h4 className="font-semibold text-lg text-gray-800 mb-3">Choose Action</h4>
              <div className="flex flex-wrap gap-3 items-center">
                {['attack', 'defend', 'raid'].map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => handleAction(act)}
                    className={`${btn} ${action === act ? 'bg-red-600 text-white' : 'bg-gray-200 text-black'}`}
                  >
                    {act.toUpperCase()}
                  </button>
                ))}
                {action === 'attack' && (
                  <select
                    value={target}
                    onChange={(e) => {
                      const chosen = e.target.value;
                      if (chosen) handleAttackTarget(chosen);
                    }}
                    className="p-2 border-2 border-black rounded-lg bg-white text-black"
                  >
                    <option value="">Select target</option>
                    {otherPlayers.map((p) => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {secondsLeft !== null && secondsLeft <= 20 && !gameOver && (
            <p className={`mb-2 text-lg font-semibold ${secondsLeft <= 10 ? 'text-red-700 animate-pulse' : 'text-red-600'}`}>
              Time left: {secondsLeft}s
            </p>
          )}

          {(state.round > 0 || state.gameover) && (
            <div className="w-full mt-2 mb-6">
              <h3 className="font-semibold text-xl text-gray-800 mb-4">Round Messages</h3>
              <ul className="list-disc pl-6 text-gray-700 bg-white p-6 rounded-xl shadow-sm space-y-2">
                {messages?.map((m, i) => (
                  <li key={i}>{Array.isArray(m) ? m.join(' ') : m}</li>
                ))}
              </ul>
            </div>
          )}

          {isChoosingDeny && (
            <div className="bg-amber-50 border border-amber-200 p-6 mt-6 rounded-xl w-full">
              <h3 className="font-semibold text-lg text-amber-800 mb-4">Choose someone to deny next round</h3>
              <div className="flex gap-4 items-center flex-wrap">
                <select
                  value={denyTarget}
                  onChange={(e) => setDenyTarget(e.target.value)}
                  className="border border-gray-200 rounded-lg p-2.5 bg-white text-gray-700 flex-1 min-w-[120px]"
                >
                  <option value="">Select player</option>
                  {eligibleTargets.map((p) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!denyTarget}
                  onClick={handleDeny}
                  className={`${btn} bg-gray-200 text-black disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Deny
                </button>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl mt-6 w-full text-center">
              <p className="text-xl font-semibold mb-3">Game Over! {state.winner} has won the game!</p>
              <div className="flex flex-col gap-3 items-center">
                <Link href="/" className="text-blue-600 hover:underline font-medium">
                  ← Back to Home
                </Link>
                {typeof state.replay_votes_needed === 'number' && state.replay_votes_needed > 0 && (
                  <>
                    <p className="text-sm text-green-700">
                      {state.replay_votes_count ?? 0} / {state.replay_votes_needed} ready to replay
                    </p>
                    <button
                      type="button"
                      disabled={replayVoted || replayLoading}
                      onClick={handleReplay}
                      className={`${btn} bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {replayVoted ? 'Voted to replay' : replayLoading ? '…' : 'Replay'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
