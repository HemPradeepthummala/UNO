import { useContext, useEffect, useRef } from "react";
import { GameContext } from "../context/GameContext";
import { GameMessage } from "../types/index";

const WS_URL = "ws://localhost:8000/ws";

export function useGameSocket(): WebSocket {
  const { dispatch } = useContext(GameContext);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "PLAYER_ID") {
          localStorage.setItem("playerId", message.payload);
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

  return wsRef.current || new WebSocket(WS_URL);
}
