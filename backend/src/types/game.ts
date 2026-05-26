import { Player } from "./player.ts";
import { Card } from "./card.ts";

export type GameStatus = "waiting" | "playing" | "finished";

export interface GameState {
  players: Player[];
  currentPlayerId: string;
  discardTop: Card | null;
  drawPileCount: number;
  status: GameStatus;
  winnerId?: string;
}

export interface GameMessage {
  type: string;
  payload?: unknown;
  cardId?: string;
}
