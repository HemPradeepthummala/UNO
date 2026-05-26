import { useContext, useEffect, useMemo, useState } from "react";
import { GameContext, GameProvider } from "./context/GameContext.tsx";
import { useGameSocket } from "./socket/useGameSocket.ts";
import { Card } from "./components/Card.tsx";
import type { Player } from "./types/index.ts";
import "./App.css";

function OpponentCards({ count }: { count: number }) {
  const visible = Math.min(Math.max(count, 1), 10);
  const start = -((visible - 1) * 14) / 2;

  return (
    <div className="opponent-hand">
      {Array.from({ length: visible }).map((_, index) => {
        const rotate = ((index % 5) - 2) * 1.8;
        return (
          <div
            key={`${index}-${count}`}
            className="card-back"
            style={{
              marginLeft: index === 0 ? 0 : -58,
              transform: `translateX(${start + index * 14}px) rotate(${rotate}deg)`,
            }}
          >
            <div className="card-back-inner" />
          </div>
        );
      })}
    </div>
  );
}

function OpponentSpot({
  player,
  active,
  placement,
}: {
  player?: Player;
  active: boolean;
  placement: "top-opponent" | "left-opponent" | "right-opponent";
}) {
  if (!player) return null;

  return (
    <div
      className={`opponent-area ${placement} ${active ? "active" : "inactive"}`}
    >
      <div className="player-label">PLAYER {player.id}</div>
      <OpponentCards count={player.hand.length} />
    </div>
  );
}

function GameBoard() {
  const { state } = useContext(GameContext);
  const { playCard, drawCard } = useGameSocket();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string>("");
  const [showActionMessage, setShowActionMessage] = useState(false);

  const currentPlayer = state.players.find((p) => p.id === state.currentPlayerId);
  const localPlayer = state.players.find((p) => p.id === state.localPlayerId);
  const opponents = localPlayer
    ? state.players.filter((p) => p.id !== localPlayer.id)
    : state.players;
  const isMyTurn = Boolean(localPlayer && currentPlayer?.id === localPlayer.id);
  const isSpectating = state.status !== "waiting" && !localPlayer;
  const isGameFinished = state.status === "finished";
  const winner = state.players.find((p) => p.id === state.winnerId);
  const topOpponent = opponents[0];
  const leftOpponent = opponents[1];
  const rightOpponent = opponents[2];

  const playableIds = useMemo(
    () => new Set(localPlayer?.playableCardIds ?? []),
    [localPlayer?.playableCardIds],
  );

  useEffect(() => {
    setSelectedCardId(null);
  }, [state.currentPlayerId]);

  useEffect(() => {
    const action = state.lastAction;
    if (!action) return;

    const actor = action.playerId;
    const target = action.targetPlayerId;
    const message =
      action.type === "draw_two"
        ? `+2  Player ${actor} -> Player ${target}`
        : action.type === "skip"
          ? `SKIP  Player ${actor} skipped Player ${target}`
          : "REVERSE  Direction changed";

    setActionMessage(message);
    setShowActionMessage(true);
    const timer = window.setTimeout(() => setShowActionMessage(false), 900);
    return () => window.clearTimeout(timer);
  }, [state.lastAction]);

  const onDraw = () => {
    if (!isMyTurn || isGameFinished) return;
    drawCard();
  };

  const onCardClick = (card: { id: string }) => {
    if (!isMyTurn || isGameFinished || !playableIds.has(card.id)) return;

    if (selectedCardId !== card.id) {
      setSelectedCardId(card.id);
      return;
    }

    playCard(card.id);
    setSelectedCardId(null);
  };

  return (
    <div className="uno-root">
      <div className="top-bar">
        <div className="title">UNO TABLE</div>
        <div>
          {state.status === "waiting"
            ? "Waiting for players..."
            : isGameFinished
              ? "Game Finished"
              : isSpectating
                ? "Spectating"
                : isMyTurn
                  ? "Your Turn"
                  : "Opponent's Turn"}
        </div>
      </div>

      <div className="table-area">
        <div className={`action-indicator ${showActionMessage ? "visible" : ""}`}>
          {actionMessage}
        </div>

        <OpponentSpot
          player={topOpponent}
          active={currentPlayer?.id === topOpponent?.id}
          placement="top-opponent"
        />
        <OpponentSpot
          player={leftOpponent}
          active={currentPlayer?.id === leftOpponent?.id}
          placement="left-opponent"
        />
        <OpponentSpot
          player={rightOpponent}
          active={currentPlayer?.id === rightOpponent?.id}
          placement="right-opponent"
        />

        <div className="center-board">
          <button
            onClick={onDraw}
            className={`deck-btn ${!isMyTurn || isGameFinished ? "disabled" : ""}`}
            disabled={!isMyTurn || isGameFinished}
          >
            <div
              className="deck-card"
              style={{ opacity: isMyTurn && !isGameFinished ? 1 : 0.65 }}
            >
              <div className="uno-gradient">UNO</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{state.drawPileCount}</div>
            </div>
          </button>

          <div className="discard-zone">
            <div className="discard-shadow-card one" />
            <div className="discard-shadow-card two" />
            <div className="discard-main">
              {state.discardTop ? (
                <Card card={state.discardTop} isPlayable={false} isInteractive={false} />
              ) : (
                <div className="deck-card" />
              )}
            </div>
          </div>
        </div>

        <div className="hand-zone">
          <div className="hand-label">YOUR HAND</div>
          <div className="player-hand">
            {localPlayer?.hand && localPlayer.hand.length > 0 ? (
              localPlayer.hand.map((card, index) => (
                <Card
                  key={card.id}
                  card={card}
                  isPlayable={playableIds.has(card.id)}
                  isInteractive={isMyTurn && !isGameFinished}
                  selected={selectedCardId === card.id}
                  overlapOffset={index === 0 ? 0 : -18}
                  onClick={() => onCardClick(card)}
                />
              ))
            ) : (
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                {state.status === "waiting"
                  ? "Waiting for game..."
                  : isSpectating
                    ? "Spectating"
                    : "No cards"}
              </div>
            )}
          </div>
        </div>
      </div>

      {isGameFinished && winner && (
        <div className="winner-modal">
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "Fredoka, Nunito, sans-serif" }}>
            {winner.id === state.localPlayerId ? "You Won! 🎉" : `Player ${winner.id} Won`}
          </div>
          <div style={{ marginTop: 10, opacity: 0.9 }}>Game Over</div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameBoard />
    </GameProvider>
  );
}

export default App;
