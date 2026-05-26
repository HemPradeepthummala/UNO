import { Hono } from "hono";
import type { Context } from 'hono'
import type { GameState } from "./types/game.ts";
import type { Player } from "./types/player.ts";
import type { ActionType, Card } from "./types/card.ts";
import { createDeck, isPlayable, shuffleArray } from "./types/card.ts";

const app = new Hono();

const clientConnections = new Map<string, WebSocket>();
const playerWebSockets = new Map<string, WebSocket>();
const connectionPlayerIds = new Map<string, string>();
const connectionClientIds = new Map<string, string>();
const clientPlayerIds = new Map<string, string>();
let nextConnectionId = 1;
let gameState: GameState | null = null;
let drawPile: Card[] = [];
let discardPile: Card[] = [];
let turnDirection: 1 | -1 = 1;

function initializeGame(): void {
  if (gameState?.status === "playing") return;

  const playerConnections = getFirstDistinctClientConnections(2);
  if (playerConnections.length < 2) return;

  connectionPlayerIds.clear();
  playerWebSockets.clear();
  clientPlayerIds.clear();

  const players: Player[] = playerConnections.map((_, index) => ({
    id: String(index + 1),
    hand: [],
    playableCardIds: [],
  }));

  playerConnections.forEach(({ connectionId, clientId }, index) => {
    const ws = clientConnections.get(connectionId);
    if (ws) {
      const playerId = String(index + 1);
      clientPlayerIds.set(clientId, playerId);
      connectionPlayerIds.set(connectionId, playerId);
      playerWebSockets.set(playerId, ws);
      sendPlayerId(ws, playerId);
    }
  });

  const deck = shuffleArray(createDeck());
  drawPile = [...deck];
  discardPile = [];
  turnDirection = 1;

  for (const player of players) {
    for (let i = 0; i < 7; i++) {
      const card = drawPile.pop();
      if (card) player.hand.push(card);
    }
  }

  const startCard = drawPile.pop();
  if (!startCard) return;
  discardPile.push(startCard);

  const currentPlayer = players[0];

  gameState = {
    players,
    currentPlayerId: currentPlayer.id,
    discardTop: startCard,
    drawPileCount: drawPile.length,
    status: "playing",
    lastAction: null,
  };
  updatePlayableCards(currentPlayer);

  broadcastGameState();
}

function getFirstDistinctClientConnections(
  count: number,
): Array<{ connectionId: string; clientId: string }> {
  const seenClientIds = new Set<string>();
  const connections: Array<{ connectionId: string; clientId: string }> = [];

  for (const [connectionId, clientId] of connectionClientIds) {
    const socket = clientConnections.get(connectionId);
    if (
      socket?.readyState !== WebSocket.OPEN ||
      seenClientIds.has(clientId) ||
      clientPlayerIds.has(clientId)
    ) {
      continue;
    }

    seenClientIds.add(clientId);
    connections.push({ connectionId, clientId });

    if (connections.length === count) break;
  }

  return connections;
}

function sendPlayerId(socket: WebSocket, playerId: string): void {
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(
    JSON.stringify({
      type: "PLAYER_ID",
      payload: playerId,
    }),
  );
}

function sendGameState(socket: WebSocket): void {
  if (socket.readyState !== WebSocket.OPEN || !gameState) return;

  socket.send(
    JSON.stringify({
      type: "GAME_STATE",
      payload: gameState,
    }),
  );
}

function updatePlayableCards(player: Player): void {
  if (!gameState || !gameState.discardTop) return;
  player.playableCardIds = player.hand
    .filter((card) => isPlayable(card, gameState?.discardTop!))
    .map((card) => card.id);
}

function switchTurn(steps = 1): void {
  if (!gameState) return;
  const currentIndex = gameState.players.findIndex(
    (p) => p.id === gameState!.currentPlayerId,
  );
  const playerCount = gameState.players.length;
  const rawIndex = currentIndex + steps * turnDirection;
  const nextIndex = ((rawIndex % playerCount) + playerCount) % playerCount;
  const nextPlayer = gameState.players[nextIndex];
  gameState.currentPlayerId = nextPlayer.id;
  updatePlayableCards(nextPlayer);
}

function drawCardsForPlayer(player: Player, count: number): void {
  for (let i = 0; i < count; i++) {
    if (drawPile.length === 0) {
      if (discardPile.length <= 1) return;
      const topCard = discardPile.pop();
      drawPile = shuffleArray(discardPile);
      discardPile = topCard ? [topCard] : [];
    }

    const card = drawPile.pop();
    if (!card) return;
    player.hand.push(card);
  }
}

function applyActionCardEffects(card: Card, playerId: string): void {
  if (!gameState || typeof card.value === "number") return;

  const currentIndex = gameState.players.findIndex((p) => p.id === playerId);
  if (currentIndex === -1) return;
  const playerCount = gameState.players.length;
  const targetIndex =
    ((currentIndex + turnDirection) % playerCount + playerCount) % playerCount;
  const targetPlayer = gameState.players[targetIndex];

  if (card.value === "reverse") {
    turnDirection = turnDirection === 1 ? -1 : 1;
    gameState.lastAction = {
      type: "reverse",
      playerId,
    };

    if (playerCount === 2) {
      switchTurn(2);
      return;
    }

    switchTurn(1);
    return;
  }

  if (!targetPlayer) {
    switchTurn(1);
    return;
  }

  if (card.value === "skip") {
    gameState.lastAction = {
      type: "skip",
      playerId,
      targetPlayerId: targetPlayer.id,
    };
    switchTurn(2);
    return;
  }

  if (card.value === "draw_two") {
    drawCardsForPlayer(targetPlayer, 2);
    gameState.lastAction = {
      type: "draw_two",
      playerId,
      targetPlayerId: targetPlayer.id,
    };
    switchTurn(2);
  }
}

function handlePlayCard(connectionId: string, cardId: string): void {
  if (!gameState || gameState.status !== "playing") return;

  const playerId = connectionPlayerIds.get(connectionId);
  if (!playerId) return;

  if (gameState.currentPlayerId !== playerId) return;

  const player = gameState.players.find((p) => p.id === playerId);
  if (!player) return;

  const cardIndex = player.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return;

  const card = player.hand[cardIndex];
  if (!player.playableCardIds.includes(cardId)) return;

  player.hand.splice(cardIndex, 1);
  discardPile.push(card);
  gameState.discardTop = card;
  gameState.lastAction = null;

  if (player.hand.length === 0) {
    gameState.status = "finished";
    gameState.winnerId = playerId;
    gameState.drawPileCount = drawPile.length;
    broadcastGameState();
    return;
  }

  if (typeof card.value === "number") {
    switchTurn();
  } else {
    applyActionCardEffects(card, playerId);
  }
  gameState.drawPileCount = drawPile.length;
  broadcastGameState();
}

function handleDrawCard(connectionId: string): void {
  if (!gameState || gameState.status !== "playing") return;

  const playerId = connectionPlayerIds.get(connectionId);
  if (!playerId) return;

  if (gameState.currentPlayerId !== playerId) return;

  const player = gameState.players.find((p) => p.id === playerId);
  if (!player) return;

  drawCardsForPlayer(player, 1);
  gameState.lastAction = null;
  updatePlayableCards(player);

  if (player.playableCardIds.length === 0) {
    switchTurn();
  }

  gameState.drawPileCount = drawPile.length;
  broadcastGameState();
}

function broadcastGameState(): void {
  const message = JSON.stringify({
    type: "GAME_STATE",
    payload: gameState,
  });

  clientConnections.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

async function handleWebSocket(req: Request): Promise<Response> {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("not a websocket", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const connectionId = String(nextConnectionId++);
  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId") || connectionId;

  socket.onopen = () => {
    clientConnections.set(connectionId, socket);
    connectionClientIds.set(connectionId, clientId);

    const existingPlayerId = clientPlayerIds.get(clientId);
    if (existingPlayerId && gameState?.status === "playing") {
      connectionPlayerIds.set(connectionId, existingPlayerId);
      playerWebSockets.set(existingPlayerId, socket);
      sendPlayerId(socket, existingPlayerId);
      sendGameState(socket);
      return;
    }

    initializeGame();
    if (gameState) {
      sendGameState(socket);
    }
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === "PLAY_CARD") {
        handlePlayCard(connectionId, message.cardId);
      } else if (message.type === "DRAW_CARD") {
        handleDrawCard(connectionId);
      }
    } catch {
      // Parse error
    }
  };

  socket.onclose = () => {
    const playerId = connectionPlayerIds.get(connectionId);
    const closedSocket = clientConnections.get(connectionId);
    clientConnections.delete(connectionId);
    connectionPlayerIds.delete(connectionId);
    connectionClientIds.delete(connectionId);
    if (playerId && playerWebSockets.get(playerId) === closedSocket) {
      playerWebSockets.delete(playerId);
    }
  };

  return response;
}

app.get("/ws", async (ctx: Context) => {
  return await handleWebSocket(ctx.req.raw);
});

app.get("/", (context: Context) => {
  return context.text("Uno Game Server");
});

const PORT = 8000;
Deno.serve({ port: PORT }, app.fetch);
console.log(`🎮 Uno server running on http://localhost:${PORT}`);
