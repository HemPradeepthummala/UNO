import { GameState } from "../types/index";

export type GameAction =
  | { type: "SET_GAME_STATE"; payload: GameState };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_GAME_STATE":
      return action.payload;
    default:
      return state;
  }
}
