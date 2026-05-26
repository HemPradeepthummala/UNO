import { Player } from "./player.ts";
import { ActionType, Card } from "./card.ts";

export type GameStatus = "waiting" | "playing" | "finished";

export interface GameState {
  players: Player[];
  currentPlayerId: string;
  discardTop: Card | null;
  drawPileCount: number;
  status: GameStatus;
  winnerId?: string;
  lastAction?: {
    type: ActionType;
    playerId: string;
    targetPlayerId?: string;
  } | null;
}

export interface GameMessage {
  type: string;
  payload?: unknown;
  cardId?: string;
}
