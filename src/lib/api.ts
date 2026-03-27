import { BACKEND_URL } from "@/config";
import type { LobbyState, Relic } from "@/types/game";
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(BACKEND_URL);
  }
  return socket;
}

export async function createLobby(name: string, email: string): Promise<{ lobby_id: string }> {
  const res = await fetch(`${BACKEND_URL}/create_lobby`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error((errorData as { error?: string }).error ?? "Create lobby failed");
  }
  return res.json();
}

export async function joinLobby(
  joinCode: string,
  name: string,
  email: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const sock = getSocket();
    sock.emit("join_lobby", { lobby_id: joinCode, name, email });

    const handleJoined = () => {
      sock.off("joined_lobby", handleJoined);
      sock.off("error", handleError);
      resolve();
    };

    const handleError = (data: { message: string }) => {
      sock.off("joined_lobby", handleJoined);
      sock.off("error", handleError);
      reject(new Error(data.message));
    };

    sock.on("joined_lobby", handleJoined);
    sock.on("error", handleError);
  });
}

export async function getRaidLobby(playerName: string): Promise<{ lobby_id: string }> {
  const res = await fetch(`${BACKEND_URL}/get_raid_lobby`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error((errorData as { error?: string }).error ?? "Failed to enter raid.");
  }
  return res.json();
}

export async function addDummy(lobbyId: string, adminName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const sock = getSocket();
    sock.emit("add_dummy", { lobby_id: lobbyId, name: adminName });

    const handleError = (data: { message: string }) => {
      sock.off("error", handleError);
      reject(new Error(data.message));
    };

    sock.on("error", handleError);

    // Assume success if no error, since state update will happen
    setTimeout(() => {
      sock.off("error", handleError);
      resolve();
    }, 1000); // Timeout after 1s
  });
}

export async function startGame(lobbyId: string, adminName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const sock = getSocket();
    sock.emit("start_game", { lobby_id: lobbyId, admin: adminName });

    const handleError = (data: { message: string }) => {
      sock.off("error", handleError);
      reject(new Error(data.message));
    };

    sock.on("error", handleError);

    // Assume success if no error
    setTimeout(() => {
      sock.off("error", handleError);
      resolve();
    }, 1000);
  });
}

export async function getNextRaidTime(): Promise<{ start_time: number }> {
  const res = await fetch(`${BACKEND_URL}/get_next_raid_time`);
  if (!res.ok) throw new Error("Failed to fetch next raid time");
  return res.json();
}

export async function getPlayerRelics(playerName: string): Promise<{ relics: Relic[] }> {
  const res = await fetch(`${BACKEND_URL}/get_player_relics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName }),
  });
  if (!res.ok) return { relics: [] };
  return res.json();
}

export async function createGremlinLobby(playerName: string): Promise<{ lobby_id: string }> {
  const res = await fetch(`${BACKEND_URL}/create_gremlin_lobby`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error((errorData as { error?: string }).error ?? "Failed to create gremlin lobby");
  }
  return res.json();
}

export async function getState(lobbyId: string): Promise<LobbyState> {
  const res = await fetch(`${BACKEND_URL}/get_state/${lobbyId}`);
  if (!res.ok) throw new Error(`get_state failed: ${res.status}`);
  return res.json();
}

export async function kickPlayer(lobbyId: string, admin: string, target: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/kick_player/${lobbyId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ admin, target }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error((data as { error?: string }).error ?? "Failed to kick");
  }
}

export async function submitChoice(
  lobbyId: string,
  payload: {
    player: string;
    resource?: string;
    action?: string;
    target?: string;
  }
): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/submit_choice/${lobbyId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error((data as { error?: string }).error ?? "API error");
  }
}

export async function submitDenyTarget(
  lobbyId: string,
  player: string,
  target: string
): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/submit_deny_target/${lobbyId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player, target }),
  });
  if (!res.ok) throw new Error("Failed to submit deny");
}

export async function getPlayerMessages(
  lobbyId: string,
  playerName: string
): Promise<{ messages: string[][] }> {
  const res = await fetch(`${BACKEND_URL}/get_player_messages/${lobbyId}/${playerName}`);
  if (!res.ok) return { messages: [] };
  return res.json();
}

export async function sendMessage(lobbyId: string, name: string, message: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/send_message/${lobbyId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, message }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error((data as { error?: string }).error ?? "Failed to send message");
  }
}

export async function requestReplay(lobbyId: string, player: string): Promise<{ next_lobby_id?: string }> {
  const res = await fetch(`${BACKEND_URL}/request_replay/${lobbyId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error((data as { error?: string }).error ?? "Failed to vote");
  }
  return res.json();
}
