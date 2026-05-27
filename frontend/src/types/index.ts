export type CardColor = "red" | "green" | "blue" | "yellow" | "wild";
export type ActiveColor = Exclude<CardColor, "wild">;
export type ActionType =
  | "draw_two"
  | "skip"
  | "reverse"
  | "wild"
  | "wild_draw_four";
export type CardValue = "number" | ActionType;

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
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
  activeColor: ActiveColor;
  hasDrawnThisTurn: boolean;
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
  payload: GameState;
}
