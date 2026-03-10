# World of Mythos — Frontend

3D multiplayer turn-based strategy game frontend built with Next.js and React Three Fiber. Players battle around a table in sacred cities across a mythological world map.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript 5**
- **React Three Fiber** / **Three.js** — 3D scenes and character models
- **Tailwind CSS 4** — UI styling
- **Netlify** — deployment

## Getting Started

### Prerequisites

- Node.js
- A running backend server (see [Backend](#backend))

### Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | `http://localhost:5000` |

### Scripts

```bash
npm run dev    # Start dev server (Turbopack)
npm run build  # Production build
npm start      # Start production server
npm run lint   # Run ESLint
```

## Project Structure

```
src/
├── app/                    # Next.js pages (App Router)
│   ├── page.tsx            # Home / World Map
│   ├── lobby/[lobbyId]/    # Battle lobby
│   ├── gremlin/[lobbyId]/  # Gremlin fight variant
│   ├── vault/              # Artifact vault unlock
│   ├── rules/              # Game rules
│   ├── leaderboards/       # Player rankings
│   ├── login/              # Authentication
│   └── signup/
├── components/
│   ├── worldmap/           # 3D globe with city markers
│   ├── lobby/              # Battle lobby scene + overlay
│   ├── gremlin/            # Gremlin mode scene + overlay
│   ├── home/               # Main menu overlay
│   ├── Model.tsx           # Temple/arena 3D model
│   ├── Playerv1.tsx        # Player character model
│   ├── mountain.tsx        # Mountain backdrop
│   ├── Table.tsx           # Game table
│   └── ExplosionEffect.tsx # VFX
├── lib/
│   ├── api.ts              # Backend API client
│   ├── cities.ts           # Sacred city definitions
│   └── sceneConstants.ts   # 3D scene positioning
├── types/
│   └── game.ts             # TypeScript interfaces
└── config.ts               # Backend URL config

public/
├── models/                 # 3D models (.glb)
├── textures/               # Earth textures for world map
└── images/                 # UI assets
```

## Features

- **3D World Map** — Interactive globe with 10 sacred cities, realistic Earth textures, and Fresnel atmospheric glow
- **Battle Lobbies** — 2–4 players seated at a 3D table with animated character models
- **Turn-Based Combat** — Resource gathering, attacking, defending, raiding, and deny mechanics
- **Boss Raids** — Scheduled encounters against boss characters
- **Gremlin Fights** — Alternate battle mode
- **Vault System** — 8-digit code unlock for rare artifacts
- **Leaderboards** — Player rankings
- **Bot Support** — Add AI bots to fill lobby slots

## Backend

This frontend expects a backend API server. In production, the backend runs at `https://tjuvpakk-backend.onrender.com`. For local development, run the backend on port 5000 or set `NEXT_PUBLIC_BACKEND_URL` to point to your backend instance.

## Deployment

Deployed to Netlify with the Next.js plugin. Configuration is in `netlify.toml`.
