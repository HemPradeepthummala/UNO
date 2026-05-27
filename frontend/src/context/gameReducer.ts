import { GameState } from "../types/index";

export interface AppState extends GameState {
  localPlayerId: string;
}

export type GameAction =
  | { type: "SET_GAME_STATE"; payload: GameState }
  | { type: "SET_LOCAL_PLAYER_ID"; payload: string };

const initialState: AppState = {
  localPlayerId: "",
  players: [],
  currentPlayerId: "",
  discardTop: null,
  activeColor: "red",
  hasDrawnThisTurn: false,
  drawPileCount: 0,
  status: "waiting",
};

export function gameReducer(
  state: AppState = initialState,
  action: GameAction,
): AppState {
  switch (action.type) {
    case "SET_GAME_STATE":
      return { ...action.payload, localPlayerId: state.localPlayerId };
    case "SET_LOCAL_PLAYER_ID":
      return { ...state, localPlayerId: action.payload };
    default:
      return state;
  }
}
