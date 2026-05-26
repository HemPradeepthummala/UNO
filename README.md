# Multiplayer UNO Game — Development Plan

## Overview

This project is a minimal real-time multiplayer UNO game built iteratively using GitHub Copilot.

The focus is:
- clean architecture
- backend-authoritative game logic
- iterative development
- low complexity
- stable multiplayer synchronization

The goal is NOT to build a full-featured UNO clone initially.

The goal is to build:
- a stable multiplayer turn engine
- minimal playable UI
- scalable architecture for future features

---

# Tech Stack

## Frontend
- React
- TypeScript
- Vite
- React Context + useReducer
- Native WebSocket client

## Backend
- Deno
- TypeScript
- Hono
- Native WebSocket support

---

# Core Architecture Principles

## Backend Is Source Of Truth

The backend is responsible for:
- deck generation
- shuffle logic
- turn management
- validation
- playable card calculation
- draw logic
- win detection
- game state synchronization

The frontend must NEVER:
- validate moves
- calculate turns
- calculate playable cards
- mutate authoritative game state

Frontend only:
- renders server state
- sends player actions
- displays UI feedback

---

# Scope (Initial MVP)

## Included
- 2 players
- number cards only
- real-time multiplayer
- turn management
- card drawing
- playable card highlighting
- win condition
- minimal UI

## Excluded
- rooms
- reconnect support
- bots
- authentication
- persistence/database
- action cards
- animations
- matchmaking
- advanced UNO rules

---

# UNO Rules (Current)

## Deck Rules

Colors:
- red
- green
- blue
- yellow

Numbers:
- 0 to 9

Distribution:
- one 0 card per color
- two copies each of 1-9 per color

Examples:
- red-0
- red-5-a
- red-5-b

---

# Play Rules

A card is playable if:
- same color
OR
- same number

Examples:
- red 5 can be played on red 2
- red 5 can be played on blue 5

---

# Turn Rules

- each player starts with 7 cards
- backend controls current turn
- backend validates every action
- backend broadcasts full updated state after every action

---

# Draw Rules

If player cannot play:
- player can draw one card

After drawing:
- if playable cards exist:
  player may choose to play
- otherwise:
  turn automatically switches

---

# Win Condition

A player wins when:
- their hand becomes empty

After game ends:
- no further actions allowed

---

# Backend Structure

```txt
backend/
  src/
    engine/
      deck.ts
      validator.ts
      game.ts

    websocket/
      handlers.ts

    types/
      card.ts
      player.ts
      game.ts

    server.ts
```

---

# Frontend Structure

```txt
frontend/
  src/
    components/
      Card.tsx

    context/
      GameContext.tsx

    socket/
      socket.ts

    types/

    App.tsx
```

---

# Backend Responsibilities

## engine/

Pure game logic only.

No websocket logic.

### deck.ts
Responsible for:
- deck creation
- shuffle logic

### validator.ts
Responsible for:
- playable card validation

### game.ts
Responsible for:
- game creation
- turn management
- draw logic
- play card logic
- win detection

---

# WebSocket Responsibilities

## websocket/

Responsible for:
- socket connection handling
- receiving events
- broadcasting state
- error messages

Should NOT contain core game logic.

---

# Frontend Responsibilities

## Frontend Handles

- rendering game state
- rendering cards
- highlighting playable cards
- sending websocket events
- displaying errors

## Frontend Does NOT Handle

- validation
- turn logic
- playable calculations
- deck management

---

# WebSocket Events

## Client → Server

### PLAY_CARD

```json
{
  "type": "PLAY_CARD",
  "cardId": "red-5-a"
}
```

### DRAW_CARD

```json
{
  "type": "DRAW_CARD"
}
```

---

# Server → Client

## GAME_STATE

```json
{
  "type": "GAME_STATE",
  "payload": {}
}
```

The backend always sends FULL game state.

No partial updates initially.

---

## ERROR

```json
{
  "type": "ERROR",
  "message": "Invalid move"
}
```

---

# GameState Shape

```ts
interface GameState {
  players: Player[];
  currentPlayerId: string;
  discardTop: Card;
  drawPileCount: number;
  status: "waiting" | "playing" | "finished";
  winnerId?: string;
}
```

---

# Player Shape

```ts
interface Player {
  id: string;
  hand: Card[];
  playableCardIds: string[];
}
```

---

# Card Shape

```ts
interface Card {
  id: string;
  color: "red" | "green" | "blue" | "yellow";
  number: number;
}
```

---

# UI Guidelines

## UI Goal

Minimal functional UI.

No images initially.

Cards should be rendered using:
- simple divs
- background colors
- numbers
- borders

---

# Layout

- player hand at bottom
- opponent info at top
- discard pile centered
- draw button near discard pile

---

# Styling Rules

Keep styling minimal:
- flex layouts
- basic spacing
- colored cards
- readable typography

Do NOT spend time on:
- animations
- realistic card visuals
- complex layouts

---

# Development Strategy

Development should happen in small isolated phases.

Every phase should:
1. implement backend feature
2. expose through websocket
3. render in frontend
4. manually verify end-to-end

---

# Important Development Rules

## Keep Functions Small

Prefer:
- isolated functions
- pure logic
- predictable state changes

Avoid:
- large files
- mixed responsibilities
- deeply nested logic

---

# Copilot Prompting Strategy

Prompts should be:
- small
- explicit
- single responsibility

GOOD:

```txt
Implement a pure TypeScript function that validates whether a card is playable using same-color or same-number rules.
```

BAD:

```txt
Build a complete multiplayer UNO game.
```

---

# Important Engineering Rules

## Always Broadcast Full State

After every valid action:
- backend broadcasts full GameState

This simplifies:
- synchronization
- debugging
- frontend logic

---

# Keep Game Engine Pure

Game engine functions should NOT:
- know about websockets
- know about frontend
- manipulate UI

Pure example:

```ts
playCard(gameState, playerId, cardId)
```

Returns:
- updated game state

---

# Initial Development Phases

## Phase 1
- project setup
- websocket connection
- minimal UI
- mock game state

## Phase 2
- deck generation
- validation logic
- real game initialization

## Phase 3
- play card event

## Phase 4
- draw card logic

## Phase 5
- win condition
- stability improvements

---

# Competition Priorities

Priority order:
1. stable multiplayer synchronization
2. backend correctness
3. clean architecture
4. responsiveness
5. UI polish

A stable simple game is better than a visually impressive buggy game.