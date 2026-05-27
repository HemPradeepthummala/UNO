import { useContext, useEffect, useRef } from "react";
import { GameContext } from "../context/GameContext.tsx";

const WS_URL = "ws://localhost:8000/ws";
const CLIENT_ID_KEY = "unoClientId";

function getClientId(): string {
  const existingId = sessionStorage.getItem(CLIENT_ID_KEY);
  if (existingId) return existingId;

  const clientId = crypto.randomUUID();
  sessionStorage.setItem(CLIENT_ID_KEY, clientId);
  return clientId;
}

export interface GameSocketMethods {
  ws: WebSocket | null;
  playCard: (cardId: string, chosenColor?: string) => void;
  drawCard: () => void;
  passTurn: () => void;
}

export function useGameSocket(): GameSocketMethods {
  const { dispatch } = useContext(GameContext);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = new URL(WS_URL);
    url.searchParams.set("clientId", getClientId());
    const ws = new WebSocket(url);

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
      if (
        ws.readyState === WebSocket.CONNECTING ||
        ws.readyState === WebSocket.OPEN
      ) {
        ws.close();
      }
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };
  }, [dispatch]);

  const playCard = (cardId: string, chosenColor?: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "PLAY_CARD", cardId, chosenColor }));
    }
  };

  const drawCard = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "DRAW_CARD" }));
    }
  };

  const passTurn = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "PASS_TURN" }));
    }
  };

  return {
    ws: wsRef.current,
    playCard,
    drawCard,
    passTurn,
  };
}
