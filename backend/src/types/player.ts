import { Card } from "./card.ts";

export interface Player {
  id: string;
  hand: Card[];
  playableCardIds: string[];
}
