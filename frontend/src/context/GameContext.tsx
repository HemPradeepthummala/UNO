import React, { createContext, useReducer, ReactNode } from "react";
import { GameState } from "../types/index";
import { gameReducer } from "./gameReducer";

const initialState: GameState = {
  players: [],
  currentPlayerId: "",
  discardTop: null,
  drawPileCount: 0,
  status: "waiting",
};

export const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => {},
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}
