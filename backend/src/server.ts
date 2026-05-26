import { Hono } from "hono";
import type { Context } from 'hono'
import type { GameState } from "./types/game.ts";
import type { Player } from "./types/player.ts";
import type { Card } from "./types/card.ts";
import { createDeck, isPlayable, shuffleArray } from "./types/card.ts";

const app = new Hono();

const clientConnections = new Map<string, WebSocket>();
const playerWebSockets = new Map<string, WebSocket>();
let nextConnectionId = 1;
let gameState: GameState | null = null;
let drawPile: Card[] = [];
let discardPile: Card[] = [];

function initializeGame(): void {
  const connectionIds = Array.from(clientConnections.keys()).slice(0, 2);
  if (connectionIds.length < 2) return;

  const players: Player[] = connectionIds.map((connId, index) => ({
    id: String(index + 1),
    hand: [],
    playableCardIds: [],
  }));

  connectionIds.forEach((connId, index) => {
    const ws = clientConnections.get(connId);
    if (ws) {
      playerWebSockets.set(String(index + 1), ws);
      const msg = JSON.stringify({
        type: "PLAYER_ID",
        payload: String(index + 1),
      });
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    }
  });

  const deck = shuffleArray(createDeck());
  drawPile = [...deck];

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
  updatePlayableCards(currentPlayer);

  gameState = {
    players,
    currentPlayerId: currentPlayer.id,
    discardTop: startCard,
    drawPileCount: drawPile.length,
    status: "playing",
  };

  broadcastGameState();
}

function updatePlayableCards(player: Player): void {
  if (!gameState || !gameState.discardTop) return;
  player.playableCardIds = player.hand
    .filter((card) => isPlayable(card, gameState?.discardTop!))
    .map((card) => card.id);
}

function switchTurn(): void {
  if (!gameState) return;
  const currentIndex = gameState.players.findIndex(
    (p) => p.id === gameState!.currentPlayerId,
  );
  const nextIndex = (currentIndex + 1) % gameState.players.length;
  const nextPlayer = gameState.players[nextIndex];
  gameState.currentPlayerId = nextPlayer.id;
  updatePlayableCards(nextPlayer);
}

function handlePlayCard(connectionId: string, cardId: string): void {
  if (!gameState || gameState.status !== "playing") return;

  const playerIndex = Array.from(clientConnections.keys()).indexOf(
    connectionId,
  );
  const playerId = String(playerIndex + 1);

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

  if (player.hand.length === 0) {
    gameState.status = "finished";
    gameState.winnerId = playerId;
    broadcastGameState();
    return;
  }

  switchTurn();
  broadcastGameState();
}

function handleDrawCard(connectionId: string): void {
  if (!gameState || gameState.status !== "playing") return;

  const playerIndex = Array.from(clientConnections.keys()).indexOf(
    connectionId,
  );
  const playerId = String(playerIndex + 1);

  if (gameState.currentPlayerId !== playerId) return;

  const player = gameState.players.find((p) => p.id === playerId);
  if (!player) return;

  if (drawPile.length === 0) {
    if (discardPile.length <= 1) return;
    const topCard = discardPile.pop();
    drawPile = shuffleArray(discardPile);
    discardPile = topCard ? [topCard] : [];
  }

  const card = drawPile.pop();
  if (!card) return;

  player.hand.push(card);
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

  clientConnections.set(connectionId, socket);

  if (gameState === null && clientConnections.size === 2) {
    initializeGame();
  } else if (gameState) {
    const message = JSON.stringify({
      type: "GAME_STATE",
      payload: gameState,
    });
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  }

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
    clientConnections.delete(connectionId);
    const playerIndex = Array.from(clientConnections.keys()).indexOf(
      connectionId,
    );
    const playerId = String(playerIndex + 1);
    playerWebSockets.delete(playerId);

    if (gameState) {
      gameState = null;
      drawPile = [];
      discardPile = [];
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
