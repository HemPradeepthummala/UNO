import React, { createContext, useReducer, ReactNode } from "react";
import { gameReducer } from "./gameReducer";
import type { AppState } from "./gameReducer";

const initialState: AppState = {
  localPlayerId: "",
  players: [],
  currentPlayerId: "",
  discardTop: null,
  drawPileCount: 0,
  status: "waiting",
};

export const GameContext = createContext<{
  state: AppState;
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
