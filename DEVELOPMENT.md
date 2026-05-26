# Uno Game Development Guide

This project consists of a Deno backend with Hono and WebSocket support, and a React + TypeScript + Vite frontend.

## Directory Structure

```
uno/
├── backend/          # Deno + Hono server
│   ├── deno.json
│   ├── deno.lock
│   └── src/
│       ├── server.ts
│       └── types/
│           ├── card.ts
│           ├── player.ts
│           └── game.ts
│
└── frontend/         # React + TypeScript + Vite
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── types/
        ├── context/
        ├── components/
        └── socket/
```

## Getting Started

### Backend

```bash
# Navigate to backend
cd backend

# Run development server (watches for changes)
deno task dev

# Server starts on http://localhost:8000
# WebSocket endpoint: ws://localhost:8000/ws
```

### Frontend

```bash
# Navigate to frontend
cd frontend

# Run development server
npm run dev

# App starts on http://localhost:5173
```

## How It Works

### Backend
- Deno server using Hono framework
- WebSocket endpoint at `/ws`
- Auto-assigns player IDs to connections
- Broadcasts `GAME_STATE` messages to all connected clients
- Mock game state initialized with empty players and 108 cards in draw pile

### Frontend
- React app with TypeScript
- GameContext + useReducer for state management
- WebSocket hook (`useGameSocket`) connects to backend
- Displays:
  - Opponent card counts at top
  - Discard pile and draw pile in center
  - Current player's hand at bottom
- Card component with:
  - Color-coded backgrounds
  - Hover scaling animation
  - Fixed 80px × 120px dimensions

## Running Both Simultaneously

### Option 1: Two Terminal Windows
```bash
# Terminal 1
cd backend
deno task dev

# Terminal 2
cd frontend
npm run dev
```

### Option 2: Using VS Code Split Terminals
Open two terminals in VS Code and run the commands above in each.

## Building for Production

### Frontend
```bash
cd frontend
npm run build

# Output in frontend/dist/
```

### Backend
Deno runs TypeScript directly, no build needed.

## Development Notes

- Backend runs on port 8000
- Frontend runs on port 5173 (by default)
- WebSocket proxy configured in Vite to forward `/ws` to backend
- No external UI libraries - all styling is inline CSS
- Game logic not yet implemented, only state synchronization
