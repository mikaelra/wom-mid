# World of Mythos — Alpha UI Plan

This document is the overarching design plan for the **World of Mythos Alpha** release. It covers UI, game systems, distribution, and the work required across both the frontend (`wom-mid`) and backend (`tjuvpakk-backend`).

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
9. [Purchasable Stages (Merch)](#9-purchasable-stages-merch)
10. [Distribution — App Stores & Steam](#10-distribution--app-stores--steam)
11. [Technical Architecture Changes](#11-technical-architecture-changes)
12. [Implementation Phases](#12-implementation-phases)

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

For alpha, **only the Gremlin** event type exists. Its purpose is to teach players the game mechanics — it's a tutorial encounter wrapped in the event system.

### 4.1 Event Type (Alpha)

| Event | Description | Players | Duration | Reward | Purpose |
|-------|-------------|---------|----------|--------|---------|
| **Gremlin** | Solo or co-op fight vs a Gremlin | 1–4 | 5 min | Coins, small relic chance | Teaches attack/defend/resource mechanics |

The event system is built generically so more event types can be added later via Supabase, but alpha ships with gremlin only.

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
| `EventDetail.tsx` | Gremlin event info + join button |
| `EventTimer.tsx` | Countdown to event start/expiry |
| `EventRewards.tsx` | Post-event reward summary |

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

### 8.5 Audio Cues (Minimum Viable)

| Event | Sound |
|-------|-------|
| Round start | Drum beat |
| Attack | Slash/impact |
| Defend | Shield clang |
| Death | Low thud + echo |
| Victory | Fanfare |
| Timer low | Ticking |
| Event popup | Chime |

### 8.6 Combat HUD Redesign

```
┌─────────────────────────────────────────────────────┐
│                    Round 3                           │
│                    ⏱ 0:24                           │
│                                                      │
│  ┌─────┐                              ┌─────┐      │
│  │ P1  │        [ 3D ARENA ]          │ P2  │      │
│  │ ❤ 8 │       (city-themed)          │ ❤ 5 │      │
│  │ ⚔ 2 │                              │ ⚔ 3 │      │
│  └─────┘                              └─────┘      │
│          ┌─────┐              ┌─────┐               │
│          │ P3  │              │ P4  │               │
│          │ ❤ 3 │              │ ☠   │               │
│          │ ⚔ 1 │              │     │               │
│          └─────┘              └─────┘               │
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │ Resource: [❤ HP] [💰 Coin] [⚔ Attack]   │       │
│  │ Action:   [⚔ Attack ▼] [🛡 Defend] [🏴 Raid] │  │
│  │ Target:   [P2 ▼]                         │       │
│  │                           [Confirm]       │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  Round log:                                          │
│  • P1 attacked P3 for 2 damage                      │
│  • P2 defended successfully                          │
└─────────────────────────────────────────────────────┘
```

### 8.7 Per-City Themed Arenas

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

### 8.8 Frontend Components

| Component | Description |
|-----------|-------------|
| `CombatScene.tsx` | New arena 3D scene (per-city themed) |
| `PlayerModel.tsx` | Enhanced player with idle/attack/defend/death animations |
| `SlashVFX.tsx` | Attack visual effect (particle slash arc) |
| `ShieldVFX.tsx` | Defend visual effect (translucent dome) |
| `DamageNumber.tsx` | Floating damage number that pops up and fades |
| `RoundTitle.tsx` | "Round X" title card with animation |
| `CombatHUD.tsx` | Redesigned HUD with player cards around the arena |
| `CombatCamera.tsx` | Cinematic camera controller with attack cuts |
| `DeathEffect.tsx` | Dissolve/shatter particle effect |
| `VictoryEffect.tsx` | Confetti + spotlight for winner |

---

## 9. Purchasable Stages (Merch)

### 9.1 Concept

When players enter combat via matchmaking (accessed from the world map), each player sees a **stage** (arena background). Every player has a **default stage**, but can purchase city-themed stages as cosmetic merch.

**Key design principle**: Each player sees **their own equipped stage** on their screen, but the combat mechanics and animations are **universal and identical** for everyone. This means:
- Player A has the Athens stage equipped → they see marble columns
- Player B in the same match has the Tokyo stage equipped → they see cherry blossoms
- Both play the same fight with the same mechanics

This is purely cosmetic and creates an easily extensible revenue stream — every new city or themed stage is a new product.

### 9.2 Stage System

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

### 9.3 How It Works

```
Player equips a stage in their profile/settings
  → Enters matchmaking from world map
  → Match found, combat starts
  → Frontend loads the player's equipped stage as the 3D arena background
  → All combat mechanics, animations, VFX are universal (same for all stages)
  → Other players in the same match see THEIR own stage, not yours
```

### 9.4 UI

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

### 9.5 Frontend Components

| Component | Description |
|-----------|-------------|
| `StageShop.tsx` | Grid of purchasable stages with previews |
| `StagePreview.tsx` | 3D preview of a stage before purchase |
| `StageEquip.tsx` | Equip/unequip stage UI |

The `CombatScene.tsx` loads the arena environment based on `player.equipped_stage` rather than `lobby.city_id`.

### 9.6 Backend Requirements

- New `stages` table: `id`, `name`, `city_id` (nullable — for non-city stages), `price_cents`, `preview_image`
- New `player_stages` table: `player_name`, `stage_id`, `purchased_at`
- New `equipped_stage` column on `players` table
- New endpoints:
  - `GET /stages` — list all stages with ownership status for player
  - `POST /stages/<id>/purchase` — buy a stage
  - `POST /players/<name>/equip_stage` — equip a stage
- Combat scene: frontend reads `equipped_stage` from player data, loads that arena environment

### 9.7 Architecture Note

The stage is **client-side only** — the backend doesn't need to know which stage a player is seeing during combat. It only stores:
- Which stages the player owns
- Which stage is equipped

The frontend loads the 3D arena environment based on this. No changes to the combat engine are needed.

---

## 10. Distribution — App Stores & Steam

### 9.1 Technology Choice

| Platform | Wrapper | Notes |
|----------|---------|-------|
| **Steam** | **Tauri** | Wraps the web app as a desktop app. Lightweight. |
| **iOS** | **Capacitor** (Ionic) | Wraps Next.js output as a native iOS app via WebView. |
| **Android** | **Capacitor** (Ionic) | Same as iOS — single codebase for both mobile platforms. |
| **Web** | Direct deployment | Keep the web version running alongside native apps. |

**Recommended stack: Capacitor for mobile + Tauri for desktop/Steam.**

### 9.2 What Needs to Change

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

### 9.3 App Store Requirements

| Requirement | iOS | Android | Steam |
|-------------|-----|---------|-------|
| **Developer account** | Apple Developer ($99/yr) | Google Play ($25 one-time) | Steamworks ($100/app) |
| **Age rating** | ESRB / IARC | IARC | ESRB / PEGI |
| **Privacy policy** | Required | Required | Required |
| **Icons & screenshots** | 1024x1024 icon, 6.7" + 5.5" screenshots | 512x512 icon, phone + tablet screenshots | Library assets, capsule images |
| **IAP for DLC** | Apple IAP (30% cut) | Google Play Billing (15-30%) | Steam checkout (30%) |
| **Review time** | 1–7 days | 1–3 days | 2–5 days |

### 9.4 Project Structure Addition

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

## 11. Technical Architecture Changes

### 11.1 Backend Refactoring

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

### 11.2 Database Schema Additions

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

### 11.3 Frontend State Management

The current app uses `useState` + localStorage. For alpha with more complex state, consider:

- **Zustand** for global client state (player session, queue status, current city)
- Keep localStorage for auth tokens
- Keep 2-second polling for lobby state (upgrade to WebSockets later if needed)

### 11.4 Real-time Considerations

For matchmaking and events, polling every 2 seconds may feel sluggish. Options for alpha:

1. **Keep polling** — simplest, works for alpha scale
2. **Server-Sent Events (SSE)** — one-way push from server, lighter than WebSockets
3. **WebSockets** — full duplex, best UX but more backend work

Recommendation: **Keep polling for alpha**, add SSE for event notifications only.

---

## 12. Implementation Phases

### Phase 1: Foundation

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

### Phase 2: Events & Stats

**Goal**: Gremlin events work, city stats are tracked

Frontend:
- [ ] Event toast notifications on world map
- [ ] Gremlin event detail screen + join flow
- [ ] City leaderboard component
- [ ] City stats on player profile
- [ ] Per-city stat display in city hub

Backend:
- [ ] Create `events` table
- [ ] Background gremlin event scheduler (spawn in random cities)
- [ ] Event join endpoint (creates lobby linked to event)
- [ ] City-scoped leaderboard query
- [ ] Player city stats endpoint

### Phase 3: Matchmaking

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

### Phase 4: Combat Overhaul

**Goal**: Combat feels alive and cinematic

Frontend:
- [ ] New arena 3D scene (per-city themed — all 10 cities)
- [ ] Player idle animations
- [ ] Attack VFX (slash arc + camera shake)
- [ ] Defend VFX (shield dome)
- [ ] Damage number popups
- [ ] Death dissolve effect
- [ ] Victory celebration (confetti + spotlight)
- [ ] Round title cards
- [ ] Cinematic camera cuts on attacks
- [ ] Redesigned combat HUD
- [ ] Audio system + minimum sound effects

### Phase 5: DLC — Road to Olympus

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

### Phase 6: Platform Distribution

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
