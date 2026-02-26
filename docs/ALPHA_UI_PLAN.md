# World of Mythos — Alpha UI Plan

This document is the overarching design plan for the **World of Mythos Alpha** release. It covers UI, game systems, distribution, and the work required across both the frontend (`wom-mid`) and backend (`tjuvpakk-backend`).

---

## 0. Immediate Alpha Priorities

> **Goal: Ship something playable.** Before pursuing world maps, cities, DLC, and distribution, the following must be done first. Everything else is post-alpha.

### Must-have for Alpha

1. **Character model** — Angel-cherub 3D model replaces placeholder; sits at table during lobby, dies on death. (Work in progress.)
2. **Table-based lobby UI** — Characters sit around the table. All game actions are triggered by clicking on 3D elements or buttons anchored to characters — no flat menu panels.
3. **Combat animations** — Polished enough to feel satisfying: attack, defend, raid, death, victory. This is a priority.
4. **Lobby chat** — Players can text each other inside a lobby before and during a match.
5. **All in-game button labels are in English.**

### Not required for Alpha (post-alpha)

- World map and city system
- City chat
- Matchmaking queues
- DLC — Road to Olympus
- Per-city themed arenas
- App Store / Steam distribution
- Purchasable stages

---

---

## Table of Contents

1. [Vision & Current State](#1-vision--current-state)
2. [World Map — "The World That Meets You"](#2-world-map--the-world-that-meets-you)
3. [Cities & Locations](#3-cities--locations)
4. [Random Pop-Up Events](#4-random-pop-up-events)
5. [Stats System — Per-City & Per-Account](#5-stats-system--per-city--per-account)
6. [Matchmaking — Battle Royale & Team-Based](#6-matchmaking--battle-royale--team-based)
7. [DLC — "Road to Olympus"](#7-dlc--road-to-olympus)
8. [Combat Screen Overhaul](#8-combat-screen-overhaul)
9. [Chat System](#9-chat-system)
10. [Purchasable Stages (Merch)](#10-purchasable-stages-merch)
11. [Distribution — App Stores & Steam](#11-distribution--app-stores--steam)
12. [Technical Architecture Changes](#12-technical-architecture-changes)
13. [Implementation Phases](#13-implementation-phases)

---

## 1. Vision & Current State

### Current State

**Frontend (wom-mid):**
- Next.js 15 + React Three Fiber web app
- Single temple/mountain scene with table-based lobby
- Three modes: PvP lobby, boss raid, gremlin solo fight
- Overlay-based UI on top of 3D canvas
- Web-only, no mobile or desktop distribution

**Backend (tjuvpakk-backend):**
- Single-file Flask server (~2000 lines) with Supabase
- In-memory lobby system with 40-second rounds
- Player accounts, stats (wins/kills/games/raid wins), relics, artifacts
- Leaderboards (monthly + all-time), but no city-level granularity
- No matchmaking — manual lobby creation/join only

### Alpha Vision

The alpha transforms the game from a single-scene lobby experience into a **living world** with 10 real-world sacred and mythological cities, each with its own identity, events, and stat tracking. Players navigate a world map, encounter gremlin events that teach game mechanics, queue for matches, and can purchase the **"Road to Olympus"** DLC story campaign. The combat screen becomes cinematic. The game ships on **iOS, Android, and Steam**.

---

## 2. World Map — "The World That Meets You"

The world map is the new home screen. Instead of landing on a temple with a table, the player enters a stylized 3D globe that they can navigate.

### 2.1 World Map UI

```
┌─────────────────────────────────────────────────────┐
│  [Player Avatar + Name]         [Settings] [Relics] │
│                                                      │
│              ~~~ MYTHOS WORLD MAP ~~~                │
│                                                      │
│                 Oslo 🏔️                              │
│                                                      │
│     Mecca 🕋          Jerusalem 🏛️    Xi'an 🏯      │
│                Athens 🏛️                             │
│                  (Crete: 💀 Styx)                    │
│                        Varanasi 🕉️     Tokyo ⛩️     │
│                                                      │
│     Cusco 🏔️                          Uluru 🪨      │
│                                                      │
│          🔥 House of Hades (Underworld) 🔥           │
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │ 🔔 EVENT: A Gremlin has appeared in      │       │
│  │    Athens! Defeat it to learn the ropes. │       │
│  │                        [Go Now]          │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  [Matchmaking]  [DLC: Road to Olympus]  [Leaderboards]│
└─────────────────────────────────────────────────────┘
```

### 2.2 Design Principles

- **3D world map** rendered with React Three Fiber — stylized globe with city markers at real geographic positions
- Cities are clickable 3D landmarks (buildings, temples, glowing portals)
- Camera orbits the world; tapping a city zooms into it
- The map feels alive: clouds drift, water moves, ambient particles float
- Player avatar is shown on the map at their current "home city"
- Gremlin event banners pop up as toast notifications or floating markers on the map
- **Styx** stands on the coast of Crete — a ghostly Grim Reaper figure — as the entry point for the "Road to Olympus" DLC

### 2.3 Navigation Flow

```
World Map (home)
  ├─→ Tap City → City Hub Screen
  │     ├─→ Find Match (BR or Team)
  │     ├─→ City Leaderboards
  │     ├─→ City Events (active gremlin pop-ups)
  │     └─→ Back to Map
  ├─→ Tap Styx on Crete → DLC: Road to Olympus
  ├─→ Matchmaking Button → Queue Screen
  ├─→ Profile → Account Stats, Relics, Settings
  └─→ Event Banner → Jump to Gremlin Event
```

### 2.4 Frontend Components Needed

| Component | Description |
|-----------|-------------|
| `WorldMap.tsx` | Top-level 3D world map scene (globe with city markers) |
| `WorldMapOverlay.tsx` | UI layer: player info, nav buttons, event toasts |
| `CityMarker.tsx` | 3D clickable city on the map (building/portal model) |
| `StyxMarker.tsx` | DLC entry point — Styx character on the coast of Crete |
| `EventBanner.tsx` | Pop-up notification for gremlin events |
| `WorldMapCamera.tsx` | Orbit + zoom-to-city camera controller |

---

## 3. Cities & Locations

Each city is a real-world sacred or mythological location already stored in Supabase. Each has its own visual theme, lobby arena, and local leaderboard.

### 3.1 Cities (from Supabase)

| city_id | City | Country | Visual Style |
|---------|------|---------|-------------|
| 1 | **Mecca** | Saudi Arabia | Desert sands, golden minarets, warm light |
| 2 | **Jerusalem** | Israel | Stone walls, ancient gates, amber sunlight |
| 3 | **Athens** | Greece | White marble columns, open agora, blue sky |
| 4 | **Varanasi** | India | River ghats, temple steps, orange dawn |
| 5 | **Xi'an** | China | Terracotta guardians, red lanterns, mist |
| 6 | **Uluru** | Australia | Red desert, sacred rock, starry sky |
| 7 | **Cusco** | Peru | Mountain ruins, Incan stonework, thin air |
| 8 | **Oslo** | Norway | Viking longhouses, fjords, northern lights |
| 9 | **Tokyo** | Japan | Shinto gates, cherry blossoms, neon glow |
| 10 | **House of Hades** | Underworld | Cavern, river Styx, ghostly flames |

### 3.2 City Hub Screen

When a player taps a city on the world map, they zoom into its **City Hub**:

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Map                ATHENS                 │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ ⚔️ Find Match │  │ 🏆 City      │                │
│  │  (BR / Team) │  │  Leaderboard │                │
│  └──────────────┘  └──────────────┘                 │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ 🎪 Events    │  │ 📊 My City   │                │
│  │  (1 active)  │  │  Stats       │                │
│  └──────────────┘  └──────────────┘                 │
│                                                      │
│  [ 3D scene: Athens marble columns + agora ]         │
│                                                      │
│  Active Event: Gremlin — 2 players fighting          │
│                          [Join Event]                │
└─────────────────────────────────────────────────────┘
```

### 3.3 Frontend Components Needed

| Component | Description |
|-----------|-------------|
| `CityHub.tsx` | City-level hub with 3D preview + overlay |
| `CityScene.tsx` | Per-city 3D environment (reusable base with theme variants) |
| `CityLeaderboard.tsx` | City-scoped leaderboard display |
| `CityStats.tsx` | Player's stats in this specific city |
| `CityEventList.tsx` | Active gremlin events in this city |

### 3.4 Backend Requirements

- Existing `cities` table in Supabase with the 10 cities above
- Lobbies gain a `city_id` foreign key — every match belongs to a city
- `game_player_stats` gains a `city_id` column for per-city stat aggregation
- New endpoint: `GET /cities` — list all cities with active event counts
- New endpoint: `GET /cities/<city_id>/leaderboards` — city-scoped leaderboards
- New endpoint: `GET /cities/<city_id>/stats/<player_name>` — player stats in city

---

## 4. Random Pop-Up Events

For alpha, **two event types exist**: the Gremlin (tutorial encounter) and the **Hades Raid** (a real challenge).

### 4.1 Event Types (Alpha)

| Event | Description | Players | Duration | Reward | Purpose |
|-------|-------------|---------|----------|--------|---------|
| **Gremlin** | Solo or co-op fight vs a Gremlin | 1–4 | 5 min | Coins, small relic chance | Teaches attack/defend/resource mechanics |
| **Hades Raid** | Fight against Hades himself in the Underworld | 1–4 | ~10 min | Gold, exclusive Hades relic | Alpha's first real boss encounter — hard solo, trivial with friends |

The event system is built generically so more event types can be added later via Supabase.

### 4.2 Event Lifecycle

```
1. Backend scheduler picks a random city from the 10
2. A gremlin event is created with a start_time and expiry_time
3. All players on the world map see the event notification
4. Players in that city see it prominently in their City Hub
5. Players can join until the event starts or reaches max players
6. Event plays out using existing gremlin combat engine
7. Rewards distributed; event removed from active list
```

### 4.3 Event Spawn Rules

- Gremlins spawn on a randomized timer (e.g., every 5–15 minutes, random city)
- Max 1 active event per city at a time
- Events that aren't joined by anyone expire silently
- The existing `/create_gremlin_lobby` + `GremlinScene` is the foundation — wrap it in the event system

### 4.4 Backend Requirements

- New `events` table: `id`, `city_id`, `event_type`, `status` (pending/active/completed/expired), `start_time`, `expiry_time`, `lobby_id`, `max_players`, `reward_config`
- Background scheduler (timer thread) to spawn gremlin events in random cities
- New endpoints:
  - `GET /events/active` — all active gremlin events across all cities
  - `GET /cities/<city_id>/events` — active events in a specific city
  - `POST /events/<event_id>/join` — join a gremlin event (creates/joins its lobby)
- Events reuse the existing lobby + gremlin combat engine; the `lobby` row just has `event_id` set

### 4.5 Frontend Components Needed

| Component | Description |
|-----------|-------------|
| `EventToast.tsx` | Pop-up notification on world map |
| `EventDetail.tsx` | Event info + join button (works for both gremlin and Hades Raid) |
| `EventTimer.tsx` | Countdown to event start/expiry |
| `EventRewards.tsx` | Post-event reward summary |

---

### 4.6 Hades Raid *(Alpha — required)*

The Hades Raid is the alpha's signature encounter. It spawns in the **House of Hades** city and pits players against Hades — the god of the Underworld. Hades is a **fixed opponent**: his stats do not change based on how many players join. The difficulty difference between solo and co-op emerges naturally from having more players contributing attacks each round.

#### Starting conditions

- **Each player:** 10 HP, 1 weapon, 0 gold — the same as any other match
- **Hades:** 8 HP, 2 attacks per round (fixed, regardless of player count)

There is no artificial scaling. More players win more easily simply because they deal more combined damage.

#### Hades AI

Hades is driven by a **trained AI**, not hand-written rules. The AI is trained via self-play iteration with the target win rates as criteria:

| Scenario | Target Hades win rate |
|----------|----------------------|
| 1 player | ~70% |
| 2 players | ~20% |

The AI iterates until it reliably hits these benchmarks. This means:
- Solo feels genuinely hard — Hades has learned to exploit individual players
- Two players tip the balance strongly in the players' favour
- No hand-tuned logic; the difficulty curve is a natural outcome of the trained behaviour

#### Scene

The Hades Raid uses the **House of Hades arena** — the Underworld cavern with river Styx, ghostly flames, and stalactites. Hades appears as a large figure across the table where other players normally sit.

#### Reward

Defeating Hades grants:
- A gold reward
- Chance to earn the **Hades Relic**
- `raid_wins` stat increment (already tracked in backend)

#### Spawn rules

- Spawns exclusively in **House of Hades** city
- Spawns less frequently than Gremlins (e.g., once every 30–60 minutes)
- Max 1 active Hades Raid globally at a time
- Distinct visual treatment in world map notifications (red/purple, skull icon) to set it apart from Gremlin events

---

## 5. Stats System — Per-City & Per-Account

### 5.1 Current State

The backend tracks:
- **Per-account (global):** wins, kills, games_played, raid_wins in the `players` table
- **Per-game:** individual game records in `game_player_stats` with timestamps

### 5.2 Alpha Design

Stats are tracked at **three levels**:

```
Account Level (global)
  ├─ Total wins, kills, games, raid wins
  ├─ Total relics collected
  ├─ DLC progress (Road to Olympus chapters completed)
  └─ Achievements

City Level (per city — across all 10 cities)
  ├─ Wins in this city
  ├─ Kills in this city
  ├─ Games played in this city
  ├─ Raid wins in this city
  ├─ Gremlin events completed in this city
  └─ City rank (derived from city stats)

Game Level (per match)
  └─ (already exists — add city_id)
```

### 5.3 Leaderboard Views

| View | Scope | Description |
|------|-------|-------------|
| **Global All-Time** | All cities, all time | Existing leaderboard |
| **Global Monthly** | All cities, current month | Existing leaderboard |
| **City All-Time** | One city, all time | New — top players in that city |
| **City Monthly** | One city, current month | New — monthly city rankings |

### 5.4 Backend Changes

- Add `city_id` column to `game_player_stats`
- Add `city_stats` table (or compute from `game_player_stats` with city_id filter):
  - `player_name`, `city_id`, `wins`, `kills`, `games_played`, `raid_wins`, `events_completed`
- Update `/leaderboards` endpoint to accept `?city_id=X` filter
- New endpoint: `GET /players/<name>/city_stats` — all city breakdowns for a player
- Ensure all lobby creation endpoints accept and store `city_id`

### 5.5 Frontend Components

| Component | Description |
|-----------|-------------|
| `GlobalLeaderboard.tsx` | Full leaderboard with city filter dropdown |
| `CityLeaderboard.tsx` | City-scoped leaderboard (reuse from City Hub) |
| `PlayerProfile.tsx` | Player stats overview — global + per-city breakdown |
| `StatCard.tsx` | Reusable stat display (wins, kills, etc.) |

---

## 6. Matchmaking — Battle Royale & Team-Based

### 6.1 Current State

There is no matchmaking. Players manually create lobbies and share codes, or join the scheduled boss raid.

### 6.2 Alpha Matchmaking Design

Two queue types, both city-aware:

#### Battle Royale (Free-for-All)
- Queue up in a city
- System groups 4 players into a lobby
- Same combat rules as current PvP lobbies
- Match takes place "in" the queued city (city_id assigned)

#### Team-Based (2v2)
- Queue up with or without a partner
- System creates 2v2 lobbies
- Teams share information and coordinate
- New combat rules: team HP pool or shared targeting

### 6.3 Matchmaking Flow

```
Player opens Matchmaking (from city hub or world map)
  → Selects mode: Battle Royale / Team Battle
  → (Team Battle only) Invite friend or queue solo
  → Enters queue with city preference
  → Backend groups players when enough are queued
  → Lobby created, all players redirected
  → Match plays out in the chosen city's arena
```

### 6.4 Queue UI

```
┌─────────────────────────────────────────────────────┐
│  MATCHMAKING                              [Cancel]   │
│                                                      │
│  Mode: [⚔️ Battle Royale]  [🛡️ Team Battle]         │
│                                                      │
│  City: [Any] [Mecca] [Jerusalem] [Athens] [Varanasi] │
│        [Xi'an] [Uluru] [Cusco] [Oslo] [Tokyo]       │
│        [House of Hades]                              │
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │    Searching for opponents...            │       │
│  │    ████████░░░░░░░░  2/4 players         │       │
│  │    Estimated wait: —                     │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  (Team Battle) Your team:                            │
│    • You (ready)                                     │
│    • [Invite Friend] or [Fill with random]           │
└─────────────────────────────────────────────────────┘
```

### 6.5 Backend Requirements

**New matchmaking system** (can start simple):

- **Queue storage**: In-memory dict keyed by `(mode, city_id)` → list of waiting players
- **Matcher loop**: Background thread checks queues every 2–3 seconds
  - BR: when 4+ players in a queue → create lobby, notify
  - Team: when 4+ players (2 teams) → create lobby, assign teams
  - "Any city" players can be matched into any city queue that needs them
- **Team assignment**: New field on player object in lobby: `team` (1 or 2)
- **Team combat rules**: Players on the same team cannot attack each other; last team standing wins

**New endpoints:**
- `POST /matchmaking/join` — join queue (body: `mode`, `city_id`, `team_partner` optional)
- `POST /matchmaking/leave` — leave queue
- `GET /matchmaking/status` — check queue position, matched lobby id
- Lobby state gains `teams_enabled` boolean and player objects gain `team` field

**New DB requirements:**
- `game_player_stats` gains `mode` column (`ffa` / `team`) for leaderboard filtering

### 6.6 Frontend Components

| Component | Description |
|-----------|-------------|
| `MatchmakingScreen.tsx` | Mode selection, city filter, queue status |
| `QueueStatus.tsx` | Animated waiting indicator with player count |
| `TeamInvite.tsx` | Invite friend / fill with random UI |
| `TeamIndicator.tsx` | In-lobby team assignment display |

---

## 7. DLC — "Road to Olympus"

### 7.1 Concept

On the world map, a ghostly character called **Styx** stands on the coast of **Crete** (near Athens, but separate from any city marker). Styx looks like the Grim Reaper. If the player has purchased the DLC, Styx carries them across the sea to a **tower rising from the water**.

**Motivation**: Styx tells the player he can help save the world — inside the tower, the goddess **Hera** can transport them to **Zeus** at the top. But the player must climb the tower themselves.

### 7.2 Tower Structure

The DLC is a linear tower climb with encounters and narrative between them:

```
┌─────────────────────┐
│     ⚡ ZEUS ⚡       │  ← Final Boss: Zeus at the summit
│   (Tower Summit)    │
├─────────────────────┤
│   Hera transports   │  ← Hera moves you from mid-tower to the top
│   you upward        │
├─────────────────────┤
│   🎭 JANUS 🎭       │  ← Mid-Boss: Two-faced God (CO-OP REQUIRED)
│   (Mind Tricks)     │     Fight revolves around deception mechanics
├─────────────────────┤
│   Lower Tower       │  ← Encounters + narrative as you ascend
│   (Climb begins)    │
├─────────────────────┤
│   💀 STYX 💀        │  ← Entry: Styx carries you here from Crete
│   (Tower Base)      │
├─────────────────────┤
│   🌊 Sea 🌊         │
└─────────────────────┘
```

### 7.3 Boss: Janus (Mid-Tower) — Co-op Required

Janus is the two-faced God of transitions, doorways, and duality. This fight **requires a friend** (2-player co-op mandatory).

**Mind Trick Mechanics:**
- **Hidden choices**: Both players choose actions simultaneously, but Janus can mirror or swap their targeting
- **Deception rounds**: What's displayed on screen may not match the actual action that executes
- **Mirrored actions**: Janus can cause one player's action to affect the other player instead
- **Two faces**: Each face has different weaknesses — players must coordinate which face to attack

This fight teaches players coordination, trust, and the importance of communication.

### 7.4 Boss: Zeus (Summit) — Final Boss

Zeus awaits at the top of the tower. Uses the existing boss combat engine with unique mechanics (lightning-themed). Details TBD — to be defined when boss mechanics are designed.

### 7.5 Usable Rewards

DLC relics from bosses grant passive bonuses in **regular matches** (not just DLC):

| Relic | Source | Effect |
|-------|--------|--------|
| TBD | Janus | TBD — related to deception/duality |
| TBD | Zeus | TBD — related to lightning/power |

- Only **one relic** can be equipped at a time for balance
- Relics are usable in all game modes (PvP, events, boss raids)

### 7.6 DLC UI

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Map         ROAD TO OLYMPUS              │
│                                                      │
│  [ Atmospheric illustration: tower in the sea,      │
│    Styx's boat approaching from Crete ]              │
│                                                      │
│  🏗️ Tower Progress:                                  │
│  ┌────────────────────────────────────────┐          │
│  │ ⚡ Zeus (Summit)              🔒 Locked │          │
│  │ 🏛️ Hera's Transport          🔒 Locked │          │
│  │ 🎭 Janus (Co-op Required)    🔓 Next   │          │
│  │ 🗡️ Lower Tower               ✅ Done   │          │
│  │ 💀 Styx's Crossing            ✅ Done   │          │
│  └────────────────────────────────────────┘          │
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │ Next: Janus — The Two-Faced God         │       │
│  │                                           │       │
│  │ "Two faces watch from the shadows.       │       │
│  │  You cannot face this alone..."          │       │
│  │                                           │       │
│  │ ⚠️ Requires 1 friend to proceed          │       │
│  │                                           │       │
│  │ [Invite Friend]  [Continue Solo ✗]       │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  YOUR DLC RELICS:                                    │
│  (None yet — defeat bosses to earn relics)           │
└─────────────────────────────────────────────────────┘
```

### 7.7 Backend Requirements

- New `dlc` table: `id`, `title`, `description`, `price_cents`
- New `dlc_chapters` table: `id`, `dlc_id`, `chapter_number`, `title`, `narrative_text`, `encounters` (JSON), `requires_coop` (boolean)
- New `dlc_progress` table: `player_name`, `dlc_id`, `chapter_number`, `completed`, `completed_at`
- New `dlc_relics` table: `id`, `name`, `dlc_id`, `effect_type`, `effect_value`, `flavour_text`
- New `equipped_relic` column on `players` table (nullable FK to relic)
- Janus encounter: lobby must have 2+ players (co-op enforced server-side)
- **Janus mind trick action system**: hidden choices revealed simultaneously, mirrored/swapped targeting, deception rounds where displayed actions may not match actual actions
- Combat engine updated: check equipped relic and apply passive effect at round start
- New endpoints:
  - `GET /dlc/<dlc_id>` — DLC info + player progress
  - `POST /dlc/<dlc_id>/chapter/<num>/start` — start encounter (creates lobby with DLC boss config)
  - `POST /dlc/<dlc_id>/chapter/<num>/complete` — mark chapter done, award relic
  - `POST /players/<name>/equip_relic` — equip a DLC relic
  - `GET /players/<name>/equipped_relic` — check equipped relic
- Purchase verification: for alpha, a simple `dlc_owned` boolean on `players` table (real IAP validation comes later)

### 7.8 Frontend Components

| Component | Description |
|-----------|-------------|
| `DLCScreen.tsx` | DLC overview — Styx illustration, tower progress, chapter list |
| `TowerProgress.tsx` | Visual tower climb progress indicator |
| `NarrativePanel.tsx` | Story text display between encounters |
| `RelicEquip.tsx` | Relic selection and equip UI |
| `DLCBossScene.tsx` | Custom 3D boss environments (Janus arena, Zeus arena) |

---

## 8. Combat Screen Overhaul

### 8.1 Current State

The combat (lobby) screen is functional but static:
- Players are shown as small 3D models standing at a table
- Actions are submitted via overlay buttons
- Results are shown as text messages
- No attack animations, no VFX on hit, no dynamic camera

### 8.2 Alpha Combat Vision

The combat screen should feel **alive and cinematic**.

### 8.3 Visual Improvements

| Element | Current | Alpha Target |
|---------|---------|-------------|
| **Player models** | Static, same model | Idle animation loop, distinct skins per city |
| **Attack** | Text message only | Slash VFX + camera shake + damage number popup |
| **Defend** | Text message only | Shield dome VFX + block sound cue |
| **Raid** | Text message only | Glowing raid circle + energy beam to boss |
| **Taking damage** | Text message only | Red flash on player model + knockback |
| **Death** | Model grays out | Death animation + dissolve particles |
| **Win** | Crown emoji in overlay | Victory pose + spotlight + confetti particles |
| **Round transition** | Instant | Brief "Round X" title card with swoosh |
| **Timer** | Overlay text | 3D floating timer above table, pulses red when low |
| **Boss entrance** | Instant appear | Camera pan + boss intro animation + name title |

### 8.4 Camera System

```
Default: Fixed angle slightly above and behind "your" player
Round start: Brief zoom-out to show all players
Attack happens: Quick cut to attacker → target (like a fighting game)
Boss attack: Camera shakes
Game over: Slow orbit around winner
```

### 8.5 Execution Phase — Blackout

When **all players have submitted their choices**, the scene cuts to black before the results play out. This is the moment between choosing and seeing what happens.

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│                                                      │
│                   ████████████                       │
│                   (full black)                       │
│                                                      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Behaviour:**
- Screen fades to **full black** — no HUD, no characters, no buttons
- **Audio plays in the background**: sounds of what's happening (slash, impact, shield clang, death thud, etc.) play sequentially as the actions are resolved server-side
- The sequence of sounds gives the players a sense of what happened before they see it
- After the audio sequence (~1.5–3 seconds depending on how many events occurred), the screen fades back in
- The scene is updated to reflect the round results: HP changes, dead characters in death pose, etc.
- A brief round summary or floating damage numbers confirm what happened

**Audio sequence during blackout (example):**
```
Round submitted by all →
  [fade to black]
  → slash sound (attack)
  → impact sound (hit)
  → shield clang (defend)
  → low thud + echo (death)
  [fade back to scene]
  → round log updates + damage numbers float
```

This creates suspense and makes the resolution feel dramatic rather than instant.

### 8.6 Audio Cues (Minimum Viable)

| Event | Sound |
|-------|-------|
| Round start | Drum beat |
| Attack | Slash/impact |
| Defend | Shield clang |
| Death | Low thud + echo |
| Victory | Fanfare |
| Timer low | Ticking |
| Event popup | Chime |

### 8.7 Combat HUD Redesign — Table-Centric Interaction

**Core principle:** There is no separate action menu panel. All choices are made by clicking on 3D elements in the scene. Buttons float as overlays anchored to characters and the table.

#### Layout during the choice phase

```
┌─────────────────────────────────────────────────────┐
│                 Round 3    ⏱ 0:24                   │
│                                                      │
│      [P2 name]                    [P3 name]          │
│       ❤ 5  ⚔ 3                    ❤ 3  ⚔ 1         │
│   ┌──────────┐                ┌──────────┐           │
│   │ CHERUB   │                │ CHERUB   │           │
│   │  (sits)  │                │  (sits)  │           │
│   └──────────┘                └──────────┘           │
│  [  Attack  ]                [  Attack  ]            │
│   (on P2)                     (on P3)                │
│                                                      │
│                  ╔══════════╗                        │
│                  ║  THE     ║                        │
│                  ║  WELL    ║  ← click = Raid        │
│                  ╚══════════╝                        │
│                                                      │
│   ┌──────────┐                                       │
│   │ CHERUB   │  ← your character                     │
│   │  (sits)  │                                       │
│   └──────────┘                                       │
│  [  Defend  ]  ← button on your own character        │
│  [Get Life] [Get Gold] [Upgrade Strength]            │
│   ↑ secondary actions, in a row below Defend         │
│                                                      │
│      [P4 name]                                       │
│       ❤ 8  ⚔ 2                                      │
│   ┌──────────┐                                       │
│   │ CHERUB   │                                       │
│   └──────────┘                                       │
│  [  Attack  ]                                        │
│                                                      │
│  [Round log — collapsible, bottom edge]              │
└─────────────────────────────────────────────────────┘
```

#### Interaction rules

| What you click | Action triggered |
|----------------|-----------------|
| **"Attack" button on an enemy character** | Selects that player as your attack target and submits Attack |
| **"Defend" button on your own character** | Submits Defend |
| **The Well (center of table)** | Submits Raid |
| **"Get Life" (below Defend)** | Submits resource choice: HP |
| **"Get Gold" (below Defend)** | Submits resource choice: Gold |
| **"Upgrade Strength" (below Defend)** | Submits resource choice: Attack power |

- During the choice phase, **Attack buttons appear on all living enemy characters**
- **Defend** and the three **secondary action** buttons appear below your own character only
- **The Well** is always visible in the center of the table; it is the Raid button
- Once you have submitted a choice, all buttons grey out until the next round
- Dead characters show no buttons; their model plays the death animation and stays visible

#### Button language
All button labels are in **English** regardless of the player's language.

### 8.8 Per-City Themed Arenas

Each of the 10 cities has a distinct arena environment:

| City | Arena Theme |
|------|-------------|
| Mecca | Desert sands, golden pillars |
| Jerusalem | Ancient stone walls, warm amber light |
| Athens | Marble columns, open-air agora |
| Varanasi | River ghats, temple backdrop |
| Xi'an | Terracotta army, red pillars |
| Uluru | Red desert, sacred rock formation |
| Cusco | Mountain ruins, Incan stonework |
| Oslo | Viking longhouse, aurora backdrop |
| Tokyo | Shinto shrine, cherry blossoms |
| House of Hades | Cavern, ghostly flames, river Styx |

### 8.9 Frontend Components

| Component | Description |
|-----------|-------------|
| `CombatScene.tsx` | New arena 3D scene (per-city themed) |
| `PlayerModel.tsx` | Angel-cherub model with idle/sitting/attack/defend/death animations |
| `PlayerButtons.tsx` | Overlay buttons anchored to a character (Attack / Defend + secondaries) |
| `TheWell.tsx` | 3D well in the center of the table; clickable Raid button |
| `SlashVFX.tsx` | Attack visual effect (particle slash arc) |
| `ShieldVFX.tsx` | Defend visual effect (translucent dome) |
| `DamageNumber.tsx` | Floating damage number that pops up and fades |
| `RoundTitle.tsx` | "Round X" title card with animation |
| `CombatHUD.tsx` | Minimal HUD: round, timer, round log |
| `CombatCamera.tsx` | Cinematic camera controller with attack cuts |
| `DeathEffect.tsx` | Dissolve/shatter particle effect |
| `VictoryEffect.tsx` | Confetti + spotlight for winner |

### 8.10 Character Model — Angel Cherub

> **Status: In progress.** A 3D-generated angel-cherub model is being created and will replace all placeholder player models.

#### Model specifications

| Property | Detail |
|----------|--------|
| **Base model** | Angel-cherub (3D generated) |
| **Alpha skin** | Same model for all players in alpha; skins/cosmetics post-alpha |
| **Idle / lobby** | Sitting animation — character sits at the table during lobby and choice phases |
| **Death** | Death animation — plays when player is eliminated; model stays visible at table (greyed / slumped) |
| **Attack** | Attack animation — plays when this player's attack resolves |
| **Defend** | Block/brace animation — plays when defend resolves |
| **Victory** | Victory pose — plays for the winning player at game over |

#### Integration

- Model loaded via React Three Fiber / `@react-three/fiber` + `@react-three/drei` (`useGLTF` or `useFBX`)
- Animations driven by `AnimationMixer`; state machine maps game events → animation clips
- Positioned around the table using fixed seat positions (same as existing `PlayersAtTable` layout)
- HTML overlay buttons (`PlayerButtons.tsx`) are positioned in screen space relative to each character's 3D position using `Html` from `@react-three/drei`

---

## 9. Chat System

> **Alpha priority:** Only **lobby chat** is required for alpha. City chat requires the city system (post-alpha) and should be deferred. Lobby chat must be shipped with the playable alpha.

Two chat scopes exist in the full plan: **city chat** (global per city) and **lobby chat** (per match).

### 9.1 City Chat *(post-alpha — requires city system)*

Every city has a persistent, scrolling text chat visible in the **City Hub**. This is how players in the same city communicate, coordinate events, find teammates, and socialise.

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Map                ATHENS                 │
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │ CITY CHAT                        [Hide]  │       │
│  │                                           │       │
│  │ Spartan99: anyone up for a gremlin?      │       │
│  │ MythosKing: gg last match                │       │
│  │ You: omw to the event                    │       │
│  │                                           │       │
│  │ [Type a message...]            [Send]     │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  [Find Match]  [Events]  [Leaderboard]  [Stats]     │
└─────────────────────────────────────────────────────┘
```

**Behaviour:**
- Messages are scoped to the city — only players currently in or viewing this city see them
- Recent message history loaded on entering the city (last 50 messages)
- Messages auto-scroll; player can scroll up to read history
- Collapsible / hideable so it doesn't dominate the screen
- Simple text only (no images, no links) for alpha
- Basic spam prevention: rate limit (e.g., 1 message per 2 seconds per player)

### 9.2 Lobby Chat *(Alpha — required)*

Every active lobby has its own chat. The chat is accessed via a **corner button** that opens an overlay — it does not live permanently in the HUD. When a player sends a message, a **speech bubble appears above their 3D character** in the scene so other players can see it without opening the overlay.

#### Corner button + overlay

```
┌─────────────────────────────────────────────────────┐
│                 Round 3    ⏱ 0:24         [💬]      │  ← corner button
│                                                      │
│    (3D scene — characters, well, action buttons)    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

When [💬] is tapped, a chat overlay slides in **without covering the action buttons**:

```
┌─────────────────────────────────────────────────────┐
│                 Round 3    ⏱ 0:24         [💬 ✕]   │
│                                                      │
│  (3D scene still visible behind overlay)            │
│                                                      │
│                        ┌──────────────────────────┐ │
│                        │ CHAT               [✕]   │ │
│                        │                           │ │
│                        │ P1: attacking P3          │ │
│                        │ P2: I'll defend           │ │
│                        │ You: raiding the boss     │ │
│                        │                           │ │
│                        │ [Type...] [To: All▼][Send]│ │
│                        └──────────────────────────┘ │
│                                                      │
│  [  Defend  ]   [Get Life] [Get Gold] [Upg. Str.]   │ ← still reachable
└─────────────────────────────────────────────────────┘
```

- The overlay is **anchored to one side** (e.g., right edge) so it never covers your own character's action buttons
- The overlay can be closed with [✕] or by clicking outside it
- The corner button shows a **notification dot** when new messages arrive while the overlay is closed

#### Speech bubbles in 3D

When a player sends a message, a speech bubble appears above their character in the scene — visible to everyone without opening the overlay:

- Bubble fades out after ~3 seconds
- Shows the first ~30 characters; longer messages are truncated with "…"
- Whispers do NOT show as speech bubbles (they are private)
- `SpeechBubble.tsx` rendered using `Html` from `@react-three/drei`, anchored above each character

**Behaviour:**
- Messages are scoped to the lobby — only players in this match see them
- Chat persists for the duration of the match; cleared when lobby is destroyed
- Especially important for **team battles** (2v2) and **DLC co-op** (Janus fight)
- In team mode, an option to toggle between "team only" and "all" chat

### 9.3 Whisper (Free-for-All)

In free-for-all lobbies, players can **whisper** — send a private message to one specific player that nobody else in the match can see. This enables secret alliances, betrayals, and tactical coordination.

```
┌──────────────────────────────────────────┐
│ LOBBY CHAT                    [All ▼]    │
│                                           │
│ P1: anyone want to team up?              │
│ [whisper from P2]: let's hit P3 together │
│ You → P2: deal, I'll attack P3           │
│                                           │
│ [Type a message...]  [To: All ▼] [Send]  │
└──────────────────────────────────────────┘
```

**Behaviour:**
- Player selects a target from a dropdown: "All" (default) or a specific player name
- Whisper messages are only visible to the sender and the recipient
- Whispers are styled differently (e.g., italic, different colour) so they stand out
- Other players have no indication that a whisper was sent
- Adds a social/strategic layer to free-for-all: make temporary alliances, coordinate attacks, or bluff

### 9.4 Chat Modes Summary

| Mode | Scope | Visibility | Available in |
|------|-------|------------|-------------|
| **City chat** | Per city | All players in that city | City Hub |
| **All chat** | Per lobby | All players in the match | All lobby types |
| **Team chat** | Per lobby | Only your team | Team Battle (2v2) |
| **Whisper** | Per lobby | Only you and one target player | Free-for-All |

### 9.5 Frontend Components

| Component | Description |
|-----------|-------------|
| `ChatToggleButton.tsx` | Corner button (💬) that opens/closes the chat overlay; shows notification dot on new messages |
| `ChatOverlay.tsx` | Slide-in chat panel anchored to one screen edge; never covers action buttons |
| `ChatMessage.tsx` | Single message row (player name + text + timestamp + whisper styling) |
| `ChatInput.tsx` | Text input with target selector dropdown (All / specific player) and Send button |
| `SpeechBubble.tsx` | 3D speech bubble above a character's head (`Html` from drei); fades after ~3 seconds |

### 9.6 Backend Requirements

- **City chat**: Stored in Supabase for persistence — `chat_messages` table with `city_id`, `player_name`, `message`, `created_at`
- **Lobby chat**: Stored in-memory (part of lobby state) — no persistence needed since lobbies are temporary
- **Whisper**: `POST /lobby/<id>/chat` accepts optional `target_player` field. When set, the message is only returned to the sender and that specific player on `GET /lobby/<id>/chat`.
- **Delivery method**: For alpha, use polling (fetch new messages every 2–3 seconds). Can upgrade to SSE or WebSockets later.
- New endpoints:
  - `GET /cities/<city_id>/chat` — fetch recent city chat messages (last 50)
  - `POST /cities/<city_id>/chat` — send a city chat message
  - `GET /lobby/<lobby_id>/chat?player_name=X` — fetch lobby chat messages visible to this player (filters out whispers not addressed to them)
  - `POST /lobby/<lobby_id>/chat` — send a lobby chat message (body: `player_name`, `message`, optional `target_player` for whisper, optional `team_only` for team chat)
- Rate limiting: max 1 message per 2 seconds per player
- Message length limit: 200 characters

### 9.7 Database

```sql
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    city_id INT REFERENCES cities(id),
    player_name TEXT REFERENCES players(name),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_city_time ON chat_messages(city_id, created_at DESC);
```

Lobby chat does not need a table — it lives in the in-memory lobby dict alongside player actions and round state.

---

## 10. Purchasable Stages (Merch)

### 10.1 Concept

When players enter combat via matchmaking (accessed from the world map), each player sees a **stage** (arena background). Every player has a **default stage**, but can purchase city-themed stages as cosmetic merch.

**Key design principle**: Each player sees **their own equipped stage** on their screen, but the combat mechanics and animations are **universal and identical** for everyone. This means:
- Player A has the Athens stage equipped → they see marble columns
- Player B in the same match has the Tokyo stage equipped → they see cherry blossoms
- Both play the same fight with the same mechanics

This is purely cosmetic and creates an easily extensible revenue stream — every new city or themed stage is a new product.

### 10.2 Stage System

| Stage | Source | Price |
|-------|--------|-------|
| **Default** | Free (all players) | — |
| **Mecca Arena** | Purchasable | TBD |
| **Jerusalem Arena** | Purchasable | TBD |
| **Athens Arena** | Purchasable | TBD |
| **Varanasi Arena** | Purchasable | TBD |
| **Xi'an Arena** | Purchasable | TBD |
| **Uluru Arena** | Purchasable | TBD |
| **Cusco Arena** | Purchasable | TBD |
| **Oslo Arena** | Purchasable | TBD |
| **Tokyo Arena** | Purchasable | TBD |
| **House of Hades Arena** | Purchasable | TBD |

Future stages can be added easily — seasonal themes, DLC-themed stages, limited editions, etc.

### 10.3 How It Works

```
Player equips a stage in their profile/settings
  → Enters matchmaking from world map
  → Match found, combat starts
  → Frontend loads the player's equipped stage as the 3D arena background
  → All combat mechanics, animations, VFX are universal (same for all stages)
  → Other players in the same match see THEIR own stage, not yours
```

### 10.4 UI

```
┌─────────────────────────────────────────────────────┐
│  MY STAGES                                 [Back]    │
│                                                      │
│  Equipped: ✅ Athens Arena                           │
│                                                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Default │ │ Athens  │ │ Tokyo   │ │ Oslo    │  │
│  │  (free) │ │  ✅     │ │  🔒    │ │  🔒    │  │
│  │ [Equip] │ │[Equipped]│ │ [Buy]  │ │ [Buy]  │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ Mecca   │ │ Cusco   │ │ House   │               │
│  │  🔒    │ │  🔒    │ │ of Hades│               │
│  │ [Buy]   │ │ [Buy]   │ │  🔒    │               │
│  └─────────┘ └─────────┘ │ [Buy]   │               │
│                           └─────────┘               │
└─────────────────────────────────────────────────────┘
```

### 10.5 Frontend Components

| Component | Description |
|-----------|-------------|
| `StageShop.tsx` | Grid of purchasable stages with previews |
| `StagePreview.tsx` | 3D preview of a stage before purchase |
| `StageEquip.tsx` | Equip/unequip stage UI |

The `CombatScene.tsx` loads the arena environment based on `player.equipped_stage` rather than `lobby.city_id`.

### 10.6 Backend Requirements

- New `stages` table: `id`, `name`, `city_id` (nullable — for non-city stages), `price_cents`, `preview_image`
- New `player_stages` table: `player_name`, `stage_id`, `purchased_at`
- New `equipped_stage` column on `players` table
- New endpoints:
  - `GET /stages` — list all stages with ownership status for player
  - `POST /stages/<id>/purchase` — buy a stage
  - `POST /players/<name>/equip_stage` — equip a stage
- Combat scene: frontend reads `equipped_stage` from player data, loads that arena environment

### 10.7 Architecture Note

The stage is **client-side only** — the backend doesn't need to know which stage a player is seeing during combat. It only stores:
- Which stages the player owns
- Which stage is equipped

The frontend loads the 3D arena environment based on this. No changes to the combat engine are needed.

---

## 11. Distribution — App Stores & Steam

### 11.1 Technology Choice

| Platform | Wrapper | Notes |
|----------|---------|-------|
| **Steam** | **Tauri** | Wraps the web app as a desktop app. Lightweight. |
| **iOS** | **Capacitor** (Ionic) | Wraps Next.js output as a native iOS app via WebView. |
| **Android** | **Capacitor** (Ionic) | Same as iOS — single codebase for both mobile platforms. |
| **Web** | Direct deployment | Keep the web version running alongside native apps. |

**Recommended stack: Capacitor for mobile + Tauri for desktop/Steam.**

### 11.2 What Needs to Change

#### For Mobile (Capacitor)
- Install `@capacitor/core` and `@capacitor/cli`
- Add `capacitor.config.ts` with app ID (e.g., `com.worldofmythos.app`)
- Run `npx cap add ios` and `npx cap add android`
- Adapt touch controls: all buttons must be thumb-friendly
- Test 3D performance on mobile WebView (may need LOD reduction)
- Handle safe areas (notch, home indicator)
- Push notifications for gremlin events (via `@capacitor/push-notifications`)
- Add Capacitor plugins: haptics, status bar, splash screen

#### For Steam (Tauri)
- Add `src-tauri/` directory with Rust config
- Configure window size, title, icon
- Integrate Steamworks SDK for:
  - Steam authentication (link to game account)
  - Achievements
  - Steam overlay
  - Cloud saves (if needed later)
- Build for Windows + macOS + Linux

#### For All Platforms
- Responsive design: the UI must work at 360px (phone) to 2560px (ultrawide)
- Touch + mouse + keyboard input support
- Offline handling: graceful "no connection" screen
- Deep links: `worldofmythos://lobby/ABC123` to join directly

### 11.3 App Store Requirements

| Requirement | iOS | Android | Steam |
|-------------|-----|---------|-------|
| **Developer account** | Apple Developer ($99/yr) | Google Play ($25 one-time) | Steamworks ($100/app) |
| **Age rating** | ESRB / IARC | IARC | ESRB / PEGI |
| **Privacy policy** | Required | Required | Required |
| **Icons & screenshots** | 1024x1024 icon, 6.7" + 5.5" screenshots | 512x512 icon, phone + tablet screenshots | Library assets, capsule images |
| **IAP for DLC** | Apple IAP (30% cut) | Google Play Billing (15-30%) | Steam checkout (30%) |
| **Review time** | 1–7 days | 1–3 days | 2–5 days |

### 11.4 Project Structure Addition

```
wom-mid/
  ├── src/                    (existing Next.js app)
  ├── capacitor.config.ts     (Capacitor config)
  ├── ios/                    (generated iOS project)
  ├── android/                (generated Android project)
  ├── src-tauri/              (Tauri desktop wrapper)
  │   ├── Cargo.toml
  │   ├── tauri.conf.json
  │   └── src/
  │       └── main.rs
  └── scripts/
      ├── build-ios.sh
      ├── build-android.sh
      └── build-steam.sh
```

---

## 12. Technical Architecture Changes

### 12.1 Backend Refactoring

The current backend is a single ~2000-line file. For alpha, it should be modularized:

```
tjuvpakk-backend/
  ├── app.py                    (Flask app factory + CORS)
  ├── config.py                 (Env vars, DB config)
  ├── models/
  │   ├── player.py             (Player model + DB ops)
  │   ├── lobby.py              (Lobby state + management)
  │   ├── city.py               (City definitions)
  │   ├── event.py              (Pop-up event model)
  │   ├── dlc.py                (DLC chapters + progress)
  │   └── relic.py              (Relics + equipped relics)
  ├── routes/
  │   ├── auth.py               (login, signup)
  │   ├── lobby.py              (create, join, state, actions)
  │   ├── matchmaking.py        (queue, status, leave)
  │   ├── cities.py             (city list, city stats, city leaderboards)
  │   ├── events.py             (active events, join event)
  │   ├── dlc.py                (DLC progress, start chapter, equip relic)
  │   ├── leaderboards.py       (global + city-filtered)
  │   └── relics.py             (player relics, vault)
  ├── engine/
  │   ├── combat.py             (Round resolution logic)
  │   ├── boss_ai.py            (Boss behavior: existing bosses + DLC bosses)
  │   ├── janus_ai.py           (Janus mind trick mechanics)
  │   ├── matchmaker.py         (Background queue matcher)
  │   └── event_scheduler.py    (Background gremlin event spawner)
  ├── requirements.txt
  └── render.yaml
```

### 12.2 Database Schema Additions

```sql
-- New tables for alpha

CREATE TABLE events (
    id TEXT PRIMARY KEY,
    city_id INT REFERENCES cities(id),
    event_type TEXT NOT NULL DEFAULT 'gremlin',
    status TEXT DEFAULT 'pending',  -- 'pending', 'active', 'completed', 'expired'
    lobby_id TEXT,
    max_players INT DEFAULT 4,
    reward_config JSONB,
    start_time TIMESTAMP,
    expiry_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dlc (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,       -- 'Road to Olympus'
    description TEXT,
    price_cents INT
);

CREATE TABLE dlc_chapters (
    id TEXT PRIMARY KEY,
    dlc_id TEXT REFERENCES dlc(id),
    chapter_number INT NOT NULL,
    title TEXT NOT NULL,
    narrative_text TEXT,
    encounters JSONB,          -- [{boss_name, hp, damage, mechanics, ...}]
    requires_coop BOOLEAN DEFAULT FALSE  -- TRUE for Janus
);

CREATE TABLE dlc_progress (
    player_name TEXT REFERENCES players(name),
    dlc_id TEXT REFERENCES dlc(id),
    chapter_number INT,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    PRIMARY KEY (player_name, dlc_id, chapter_number)
);

CREATE TABLE dlc_relics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dlc_id TEXT REFERENCES dlc(id),
    effect_type TEXT NOT NULL,
    effect_value FLOAT NOT NULL,
    flavour_text TEXT
);

-- Modifications to existing tables

ALTER TABLE players ADD COLUMN dlc_owned JSONB DEFAULT '[]';
ALTER TABLE players ADD COLUMN equipped_relic_id TEXT;
ALTER TABLE players ADD COLUMN home_city INT REFERENCES cities(id);

ALTER TABLE game_player_stats ADD COLUMN city_id INT REFERENCES cities(id);
ALTER TABLE game_player_stats ADD COLUMN mode TEXT DEFAULT 'ffa';  -- 'ffa' or 'team'
ALTER TABLE game_player_stats ADD COLUMN event_id TEXT;
```

### 12.3 Frontend State Management

The current app uses `useState` + localStorage. For alpha with more complex state, consider:

- **Zustand** for global client state (player session, queue status, current city)
- Keep localStorage for auth tokens
- Keep 2-second polling for lobby state (upgrade to WebSockets later if needed)

### 12.4 Real-time Considerations

For matchmaking and events, polling every 2 seconds may feel sluggish. Options for alpha:

1. **Keep polling** — simplest, works for alpha scale
2. **Server-Sent Events (SSE)** — one-way push from server, lighter than WebSockets
3. **WebSockets** — full duplex, best UX but more backend work

Recommendation: **Keep polling for alpha**, add SSE for event notifications only.

---

## 13. Implementation Phases

> Phases are ordered by **alpha priority first**. Phases 1–3 must ship before alpha release. Phases 4–8 are post-alpha.

---

### Phase 1: Character Model & Table UI *(Alpha)*

**Goal**: Angel-cherub model in scene; table-centric action buttons; no flat menu panel

Frontend:
- [ ] Integrate angel-cherub 3D model (`useGLTF` / `useFBX`) for all players
- [ ] Sitting animation as default idle state in lobby
- [ ] Death animation on player elimination
- [ ] `PlayerButtons.tsx` — overlay buttons anchored to each character in 3D space (`Html` from drei)
  - [ ] "Attack" button visible on each enemy character during choice phase
  - [ ] "Defend" button on own character
  - [ ] "Get Life", "Get Gold", "Upgrade Strength" buttons in a row below Defend on own character
- [ ] `TheWell.tsx` — 3D well in center of table; clickable to submit Raid
- [ ] Remove / replace old flat action menu panel
- [ ] All button labels in English

Backend:
- [ ] No backend changes required for this phase

### Phase 2: Combat Animation Polish *(Alpha)*

**Goal**: Combat animations feel alive and satisfying; execution phase has dramatic blackout

Frontend:
- [ ] **Blackout execution phase**: fade to black when all players have submitted; audio plays during blackout; fade back in to reveal results
- [ ] Attack animation on attacker model when attack resolves
- [ ] Attack VFX: slash arc particle effect toward target
- [ ] Camera shake on attack hit
- [ ] Damage number popup (floats up, fades)
- [ ] Defend VFX: shield dome on model when defend resolves
- [ ] Death animation + dissolve / shatter effect
- [ ] Victory pose + confetti + spotlight on winner
- [ ] "Round X" title card with brief animated swoosh between rounds
- [ ] Cinematic camera: brief cut to attacker → target on attack
- [ ] Slow orbit around winner on game over
- [ ] Round timer: 3D floating element above table, pulses red when ≤ 10s
- [ ] Audio system: sounds for attack, defend, death, victory, timer warning; sequenced during blackout

Backend:
- [ ] No backend changes required for this phase

### Phase 3: Lobby Chat *(Alpha)*

**Goal**: Players can chat inside a lobby; speech bubbles appear above characters in scene

Frontend:
- [ ] `ChatToggleButton.tsx` — corner button (💬) with notification dot for new messages
- [ ] `ChatOverlay.tsx` — slide-in panel anchored to screen edge, does not cover action buttons
- [ ] `ChatMessage.tsx` — single message row (player name + text; whisper styled in italic)
- [ ] `ChatInput.tsx` — text input + target dropdown (All / specific player) + Send button
- [ ] `SpeechBubble.tsx` — 3D bubble above character (`Html` from drei); fades after ~3s; no bubble for whispers
- [ ] Chat polling every 2–3 seconds via `GET /lobby/<id>/chat`
- [ ] Auto-scroll to latest; player can scroll up to read history
- [ ] Maximum 200 characters per message

Backend:
- [ ] Lobby chat stored in-memory (part of lobby state dict)
- [ ] `GET /lobby/<id>/chat?player_name=X` — returns messages visible to this player (filters whispers)
- [ ] `POST /lobby/<id>/chat` — body: `player_name`, `message`, optional `target_player`
- [ ] Rate limiting: 1 message per 2 seconds per player

---

### Phase 4: Foundation — World Map & Cities *(post-alpha)*

**Goal**: World map + cities + refactored navigation

Frontend:
- [ ] Build 3D world map scene with markers for all 10 cities
- [ ] World map overlay (player info, navigation)
- [ ] City hub screen (template — Athens first)
- [ ] Styx marker on Crete coast (DLC teaser, even before DLC is built)
- [ ] Routing: `/` → world map, `/city/[cityId]` → city hub
- [ ] Move current lobby/combat into city context

Backend:
- [ ] Wire `city_id` on lobby creation (currently hardcoded to `0`)
- [ ] Wire `city_id` into `game_player_stats` (currently `location_id: 10`)
- [ ] New endpoints: `GET /cities`, `GET /cities/<id>/leaderboards`
- [ ] Begin modularizing `tjuvpakk_server.py` into route + model files

### Phase 5: City Chat *(post-alpha)*

**Goal**: City chat functional in City Hub

Frontend:
- [ ] City chat integrated into City Hub screen (reuse `ChatPanel.tsx`)
- [ ] Chat polling (every 2–3 seconds)

Backend:
- [ ] Create `chat_messages` table in Supabase
- [ ] City chat endpoints (`GET /cities/<id>/chat`, `POST /cities/<id>/chat`)
- [ ] Rate limiting (1 msg / 2s per player), message length limit (200 chars)

### Phase 6: Hades Raid *(Alpha — required)*

**Goal**: Hades appears as a fixed raid boss — 8 HP, 2 attacks — defeated by trained AI targeting ~70% win rate solo, ~20% with 2 players

Frontend:
- [ ] `EventDetail.tsx` updated to render Hades Raid with distinct visual treatment (red/purple, skull icon)
- [ ] `EventToast.tsx` — global notification on world map when a Hades Raid spawns
- [ ] `HadesScene.tsx` — Underworld arena (cavern, river Styx, ghostly flames); Hades seated at head of table
- [ ] Hades boss model / placeholder displayed opposite players
- [ ] Post-raid reward screen shows Hades Relic chance

Backend:
- [ ] Hades Raid lobby type: players start with 10 HP, 1 weapon, 0 gold; Hades starts with 8 HP, 2 attacks (no scaling)
- [ ] Hades AI module: trained via self-play iteration; target win rates ~70% (1 player), ~20% (2 players)
- [ ] AI training harness: simulate Hades Raid rounds, evaluate win %, iterate until criteria are met
- [ ] Hades Raid spawner: global, once every 30–60 min, only House of Hades city, max 1 active globally
- [ ] Hades Relic reward: stored on player record
- [ ] `raid_wins` stat increment on Hades kill

### Phase 7: Events & Stats *(post-alpha)*

**Goal**: Gremlin events work, city stats are tracked

Frontend:
- [ ] Gremlin event detail screen + join flow
- [ ] City leaderboard component
- [ ] City stats on player profile
- [ ] Per-city stat display in city hub

Backend:
- [ ] Background gremlin event scheduler (spawn in random cities)
- [ ] Event join endpoint (creates lobby linked to event)
- [ ] City-scoped leaderboard query
- [ ] Player city stats endpoint

### Phase 8: Matchmaking *(post-alpha)*

**Goal**: Players can queue for BR and team matches

Frontend:
- [ ] Matchmaking screen (mode select, city filter, queue status)
- [ ] Team invite flow
- [ ] Team indicators in lobby (colored borders, team labels)
- [ ] Queue status polling

Backend:
- [ ] In-memory matchmaking queues
- [ ] Background matcher loop
- [ ] Team assignment logic in lobby
- [ ] Combat engine: team rules (no friendly fire, team win condition)
- [ ] Matchmaking endpoints (join, leave, status)

### Phase 9: Per-City Arena Themes *(post-alpha)*

**Goal**: Each city has a visually distinct arena environment

Frontend:
- [ ] New arena 3D scenes — all 10 cities (see section 8.7)
- [ ] Audio system + minimum sound effects

### Phase 10: DLC — Road to Olympus

**Goal**: Purchasable tower climb with Styx, Janus (co-op), and Zeus

Frontend:
- [ ] DLC screen with tower progress visualization
- [ ] Narrative panel (story text between encounters)
- [ ] Janus boss arena (two-faced, mind trick visuals)
- [ ] Zeus boss arena (lightning-themed summit)
- [ ] Relic equip UI
- [ ] Purchase flow (platform-specific IAP)

Backend:
- [ ] DLC tables (dlc, dlc_chapters, dlc_progress, dlc_relics)
- [ ] Janus mind trick action system (hidden choices, mirrored targeting, deception rounds)
- [ ] Janus co-op enforcement (lobby must have 2+ players)
- [ ] Zeus boss definition with unique mechanics
- [ ] Chapter start/complete endpoints
- [ ] Relic equip endpoint
- [ ] Combat engine: apply equipped relic effects
- [ ] Purchase verification (stub for alpha, real IAP later)

### Phase 11: Platform Distribution

**Goal**: Ship on iOS, Android, and Steam

Setup:
- [ ] Add Capacitor to project, configure for iOS + Android
- [ ] Add Tauri for desktop/Steam build
- [ ] Responsive UI pass — test at all breakpoints
- [ ] Touch controls optimization
- [ ] Mobile 3D performance optimization (LOD, draw call reduction)
- [ ] Steam SDK integration (auth, achievements)
- [ ] App icons, splash screens, store screenshots
- [ ] Privacy policy and age ratings
- [ ] Apple Developer + Google Play + Steamworks accounts
- [ ] Build scripts for all platforms
- [ ] Submit to stores

---

## Appendix: New Route Map

```
/                           → World Map (3D globe + overlay)
/city/[cityId]              → City Hub (e.g., /city/3 → Athens)
/city/[cityId]/match        → Combat arena (redirected from matchmaking)
/city/[cityId]/event/[id]   → Gremlin event encounter
/matchmaking                → Matchmaking queue screen
/dlc/road-to-olympus        → DLC overview + tower progress
/dlc/road-to-olympus/[chapter] → DLC encounter (Janus, Zeus, etc.)
/profile                    → Player profile + stats + relics
/leaderboards               → Global leaderboards (with city filter)
/login                      → Login
/signup                     → Signup
/settings                   → Settings
```

## Appendix: New Backend Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cities` | List all 10 cities with active event counts |
| GET | `/cities/<id>` | City details |
| GET | `/cities/<id>/leaderboards` | City-scoped leaderboard |
| GET | `/cities/<id>/events` | Active gremlin events in city |
| GET | `/cities/<id>/chat` | Fetch recent city chat messages |
| POST | `/cities/<id>/chat` | Send a city chat message |
| GET | `/cities/<id>/stats/<player>` | Player stats in city |
| GET | `/events/active` | All active gremlin events |
| POST | `/events/<id>/join` | Join a gremlin event |
| POST | `/matchmaking/join` | Enter matchmaking queue |
| POST | `/matchmaking/leave` | Leave queue |
| GET | `/matchmaking/status` | Queue position + match result |
| GET | `/dlc/<id>` | DLC info (Road to Olympus) + player progress |
| POST | `/dlc/<id>/chapter/<num>/start` | Start DLC encounter |
| POST | `/dlc/<id>/chapter/<num>/complete` | Complete chapter |
| POST | `/players/<name>/equip_relic` | Equip a DLC relic |
| GET | `/players/<name>/equipped_relic` | Get equipped relic |
| GET | `/players/<name>/city_stats` | All city stat breakdowns |
| GET | `/lobby/<id>/chat` | Fetch lobby chat messages |
| POST | `/lobby/<id>/chat` | Send a lobby chat message |
