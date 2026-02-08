# Integration Plan: tjuvpakk-frontend → my-3d-app

This document maps **tjuvpakk-frontend** screens and buttons to **3D actions and UI** in **my-3d-app**, so we can implement “certain 3D things when buttons are pressed.”

---

## 1. High-level architecture

- **my-3d-app** stays the main app (Next.js + React Three Fiber).
- Reuse **logic and API calls** from tjuvpakk-frontend (create lobby, join, submit choices, etc.).
- **UI**: Overlay HTML (buttons, inputs, modals) on top of the 3D canvas; buttons trigger both API calls and 3D reactions.
- **Routing**: Add Next.js routes for Home, Lobby, Rules, Vault, Leaderboards, Login, Signup. The 3D scene can be:
  - **Option A**: One persistent scene; route changes only swap overlay content and 3D “mode”.
  - **Option B**: Different 3D layouts per route (e.g. home = mountain + temple, lobby = table + players).

Recommendation: **Option A** to start—single canvas, change camera/visibility/animations based on route and state.

---

## 2. Frontend feature → 3D mapping

### 2.1 Home screen (`/`)

| Frontend element | API / behavior | 3D reaction |
|------------------|----------------|-------------|
| **Log In** | Navigate to `/login` | Optional: camera pans to a “login” landmark or UI fades in. |
| **Create User** | Navigate to `/signup` | Same as above if desired. |
| **Name input + Join** | `POST /join_lobby/{code}` → navigate to `/lobby/:id` | After successful join: e.g. camera flies to “lobby” view (like current “Fly to Position”), then show players at table. |
| **Create Lobby** | `POST /create_lobby` → navigate to `/lobby/:id` | Same as Join: fly to table, show “waiting” state (fewer players or placeholder). |
| **Enter Boss-fight** | `POST /get_raid_lobby` → navigate to `/lobby/:id` | Fly to table; optional “boss” styling (e.g. different color/hat for boss player). |
| **Your relics** | `POST /get_player_relics` → modal list | No 3D required; modal overlay. Optional: small 3D “relic” icons floating near camera. |
| **Rules** | Navigate to `/rules` | Optional: camera tilt or move to a “rules” area; main change is overlay content. |
| **Rules For Nerds** | Navigate to `/rules/p1`…`/rules/p8` | Same as Rules. |
| **Leaderboards** | Navigate to `/leaderboards` | Optional: 3D “podium” or names in world space; or just overlay. |
| **Do you have a key? (Vault)** | Navigate to `/vault` | Optional: 3D “vault door” or temple emphasis; or just overlay. |
| **Soundtrack** | Music toggle | No 3D; keep as overlay. |

### 2.2 Lobby screen (`/lobby/:lobbyId`)

| Frontend element | API / behavior | 3D reaction |
|------------------|----------------|-------------|
| **Lobby loaded** | `GET /get_state/:lobbyId` (polling) | Ensure camera is at “table view”. Show **N players** at table (N = `state.players.length`); use your existing `PlayerV1` positions or scale count. |
| **Start Game** (admin) | `POST /start_game/:lobbyId` | Round goes 0 → 1. 3D: e.g. short “game start” cue (table glow, particle burst, or sound). |
| **Add Random Bot** | `POST /add_dummy` | New player in list → add one more 3D player at table (or respawn layout). |
| **Kick player** (admin) | `POST /kick_player/:lobbyId` | Player removed from list → remove or gray out that 3D character. |
| **Choose Resource** (Get ❤, Get 💰, Buy ⚔) | `POST /submit_choice` (resource) | Optional: small VFX on “your” player (e.g. heart/coin/sword icon above head, or glow). |
| **Choose Action** (attack / defend / raid) | `POST /submit_choice` (action) | **Attack**: optional “aim” line or highlight toward target. **Defend**: shield VFX on your player. **Raid**: e.g. boss-fight glow or pulse. |
| **Attack + Select target** | `POST /submit_choice` with `target` | Highlight target player in 3D (outline, color tint, or arrow). |
| **Deny** (choose player to deny) | `POST /submit_deny_target/:lobbyId` | Optional: brief “denied” effect on selected player. |
| **Round messages** | `GET /get_player_messages/:lobbyId/:name` | Keep as overlay text. Optional: floating 3D text or speech bubbles. |
| **Floating messages** | Shown after new messages | Overlay (current behavior). Optional: 3D floating label in world. |
| **Timer (seconds left)** | From `state.round_end_time` | Overlay. Optional: 3D clock or bar above table. |
| **Boss fight countdown** | `get_next_raid_time` | Overlay. Optional: 3D “portal” or timer in scene. |
| **Game Over** | `state.gameover`, `state.winner` | Crown or spotlight on winner’s 3D character; confetti/particles; camera focus on winner. |
| **Replay** | `POST /request_replay` | After redirect to new lobby, same as “Lobby loaded” for new `lobbyId`. |
| **Back to Home** | Navigate to `/` | Camera flies back to “home” position (far view of mountain/temple). |

### 2.3 Rules / Vault / Leaderboards / Login / Signup

| Screen | 3D suggestion |
|--------|----------------|
| **Rules** | Overlay only, or camera pulled back to show “world” while reading. |
| **Vault** | Overlay for key input; on correct key, optional 3D “vault open” animation or transition to Inside Vault view. |
| **Leaderboards** | Overlay list; optional 3D podium with top 3. |
| **Login / Signup** | Overlay forms; no required 3D. |

---

## 3. Shared code and config

- **Backend URL**: Copy or symlink `config.ts` (e.g. from `tjuvpakk-frontend/src/config.ts`) into `my-3d-app` so `BACKEND_URL` is shared (or use env in Next.js).
- **Types**: Move or copy `Player`, `LobbyState`, `Relic` (and any other API types) into `my-3d-app` (e.g. `src/types/game.ts`).
- **API helpers**: Optionally create `src/lib/api.ts` with functions like `createLobby`, `joinLobby`, `getState`, `submitChoice`, etc., and use them from both overlay UI and any logic that drives 3D.

---

## 4. Implementation order (suggested)

1. **Routing + config**
   - Add Next.js routes: `/`, `/lobby/[lobbyId]`, `/rules`, `/vault`, `/leaderboards`, `/login`, `/signup` (and rules sub-pages if needed).
   - Add `config.ts` and types; keep 3D canvas on a layout that persists (or on each page, same scene).

2. **Home overlay**
   - Port Home UI (name, join code, Create Lobby, Join, Enter Boss-fight, Rules, Leaderboards, Vault, Login/Signup, Relics).
   - Wire buttons to API and navigation. No 3D changes yet except optional “Fly to Position” → treat as “go to lobby” when coming from home with a lobby id.

3. **Lobby overlay + state**
   - Lobby page: fetch state with `get_state`, show players list, round, stats, timer.
   - Port action buttons: resource (Get ❤/💰/⚔), action (attack/defend/raid), target select, deny, Start Game, Add Bot, Kick.
   - Connect to existing 3D: when on `/lobby/:id`, set “table view” and show players at table (reuse `PlayersAtTable` and pass `state.players`).

4. **3D reactions (incremental)**
   - Join/Create/Enter Raid → camera fly to table + show players.
   - Start Game → small VFX (e.g. table click explosion or glow).
   - Attack/Defend/Raid → optional VFX on your player and target.
   - Game Over → highlight winner in 3D (crown, focus, confetti).
   - Optional: floating messages, timer, boss countdown in 3D.

5. **Rules, Vault, Leaderboards, Auth**
   - Port components as overlays or separate pages; add 3D only where it adds value (vault door, podium, etc.).

---

## 5. File structure (suggested)

```text
src/
  app/
    page.tsx                 → Home (3D + overlay)
    layout.tsx
    lobby/[lobbyId]/page.tsx → Lobby (3D + overlay)
    rules/page.tsx
    vault/page.tsx
    leaderboards/page.tsx
    login/page.tsx
    signup/page.tsx
  components/
    Scene3D.tsx              → Shared 3D canvas (mode: "home" | "lobby")
    Menu.tsx                 → Extend current menu; add nav links
    lobby/
      LobbyOverlay.tsx       → Players list, actions, timer, messages
      PlayerAtTable.tsx      → One player; optional highlight/VFX
    home/
      HomeOverlay.tsx        → Join, Create, Enter Raid, Rules, etc.
  lib/
    api.ts                   → createLobby, joinLobby, getState, submitChoice, ...
  types/
    game.ts                  → Player, LobbyState, Relic
  config.ts                  → BACKEND_URL
```

---

## 6. Summary table: buttons → 3D

| Button / action | 3D result |
|-----------------|-----------|
| Join / Create / Enter Raid | Camera flies to table; players appear at table. |
| Start Game | Table or scene “start” VFX. |
| Add Bot / Kick | Update number/positions of 3D players. |
| Get ❤ / 💰 / ⚔ | Optional: icon or glow above your player. |
| Attack (with target) | Optional: highlight target; attack line or slash. |
| Defend | Optional: shield VFX on your player. |
| Raid | Optional: boss-mode styling or pulse. |
| Deny | Optional: brief effect on denied player. |
| Game Over | Crown/spotlight on winner; confetti. |
| Back to Home | Camera flies back to mountain/temple. |

You can implement overlay and API first, then add 3D reactions one by one so the game stays playable while you iterate on visuals.
