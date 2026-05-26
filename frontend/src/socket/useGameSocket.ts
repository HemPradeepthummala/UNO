import { useContext, useEffect, useRef } from "react";
import { GameContext } from "../context/GameContext";
import { GameMessage } from "../types/index";

const WS_URL = "ws://localhost:8000/ws";

export interface GameSocketMethods {
  ws: WebSocket;
  playCard: (cardId: string) => void;
  drawCard: () => void;
}

export function useGameSocket(): GameSocketMethods {
  const { dispatch } = useContext(GameContext);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "PLAYER_ID") {
          dispatch({
            type: "SET_LOCAL_PLAYER_ID",
            payload: message.payload,
          });
        } else if (message.type === "GAME_STATE") {
          dispatch({
            type: "SET_GAME_STATE",
            payload: message.payload,
          });
        }
      } catch {
        // Parse error
      }
    };

    wsRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [dispatch]);

  const playCard = (cardId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "PLAY_CARD", cardId }));
    }
  };

  const drawCard = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "DRAW_CARD" }));
    }
  };

  return {
    ws: wsRef.current || new WebSocket(WS_URL),
    playCard,
    drawCard,
  };
}
