export type CardColor = "red" | "green" | "blue" | "yellow";

export interface Card {
  id: string;
  color: CardColor;
  number: number;
}

export interface Player {
  id: string;
  hand: Card[];
  playableCardIds: string[];
}

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
  payload: GameState;
}
