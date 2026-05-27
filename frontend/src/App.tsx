import { useContext, useEffect, useMemo, useState } from "react";
import { GameContext, GameProvider } from "./context/GameContext.tsx";
import { useGameSocket } from "./socket/useGameSocket.ts";
import { Card } from "./components/Card.tsx";
import type { ActiveColor, Card as UnoCard, Player } from "./types/index.ts";
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
  const isDanger = player.hand.length <= 2;

  return (
    <div
      className={`opponent-area ${placement} ${active ? "active" : "inactive"}`}
    >
      <div className="player-hud">
        <div className="avatar-wrap">
          <div className="player-avatar">{`P${player.id}`}</div>
          <span className="online-dot" />
        </div>
        <div className="player-meta">
          <div className="player-label">{`PLAYER ${player.id}`}</div>
          <div className="player-stats">
            <span className="card-count">{player.hand.length} cards</span>
            {isDanger && <span className="uno-warning">UNO!</span>}
          </div>
        </div>
      </div>
      <OpponentCards count={player.hand.length} />
    </div>
  );
}

function GameBoard() {
  const { state } = useContext(GameContext);
  const { playCard, drawCard, passTurn } = useGameSocket();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [pendingWildCard, setPendingWildCard] = useState<UnoCard | null>(null);
  const [actionMessage, setActionMessage] = useState<string>("");
  const [showActionMessage, setShowActionMessage] = useState(false);
  const [drawLockLocal, setDrawLockLocal] = useState(false);

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
  const localCards = localPlayer?.hand.length ?? 0;
  const localDanger = localCards <= 2 && state.status !== "waiting";

  const playableIds = useMemo(
    () => new Set(localPlayer?.playableCardIds ?? []),
    [localPlayer?.playableCardIds],
  );

  useEffect(() => {
    setSelectedCardId(null);
    setPendingWildCard(null);
  }, [state.currentPlayerId]);

  useEffect(() => {
    if (!isMyTurn || state.hasDrawnThisTurn) {
      setDrawLockLocal(false);
    }
  }, [isMyTurn, state.hasDrawnThisTurn, state.drawPileCount]);

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
          : action.type === "reverse"
            ? "REVERSE  Direction changed"
            : action.type === "wild_draw_four"
              ? `+4  Player ${actor} -> Player ${target}`
              : `WILD  Player ${actor} changed color`;

    setActionMessage(message);
    setShowActionMessage(true);
    const timer = window.setTimeout(() => setShowActionMessage(false), 900);
    return () => window.clearTimeout(timer);
  }, [state.lastAction]);

  const onDraw = () => {
    if (!isMyTurn || isGameFinished || state.hasDrawnThisTurn || drawLockLocal) return;
    setDrawLockLocal(true);
    drawCard();
  };

  const onCardClick = (card: UnoCard) => {
    if (!isMyTurn || isGameFinished || !playableIds.has(card.id)) return;

    if (selectedCardId !== card.id) {
      setSelectedCardId(card.id);
      return;
    }

    if (card.value === "wild" || card.value === "wild_draw_four") {
      setPendingWildCard(card);
      return;
    }

    playCard(card.id);
    setSelectedCardId(null);
  };

  const playWildCardWithColor = (chosenColor: ActiveColor) => {
    if (!pendingWildCard) return;
    playCard(pendingWildCard.id, chosenColor);
    setPendingWildCard(null);
    setSelectedCardId(null);
  };

  const onPassTurn = () => {
    if (!isMyTurn || isGameFinished || !state.hasDrawnThisTurn) return;
    passTurn();
  };

  return (
    <div className="uno-root">
      <div className="top-bar">
        <div className="title">UNO ARENA</div>
        <div className="status-pill">
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
        <div className="local-hud">
          <div className={`local-player-panel ${isMyTurn ? "active" : ""}`}>
            <div className="avatar-wrap">
              <div className="player-avatar me">
                {state.localPlayerId ? `P${state.localPlayerId}` : "SP"}
              </div>
              <span className="online-dot" />
            </div>
            <div className="player-meta">
              <div className="player-label">{state.localPlayerId ? `PLAYER ${state.localPlayerId}` : "SPECTATOR"}</div>
              <div className="player-stats">
                <span className="card-count">{localCards} cards</span>
                {localDanger && <span className="uno-warning">UNO!</span>}
              </div>
            </div>
          </div>
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
            className={`deck-btn ${!isMyTurn || isGameFinished || state.hasDrawnThisTurn || drawLockLocal ? "disabled" : ""}`}
            disabled={!isMyTurn || isGameFinished || state.hasDrawnThisTurn || drawLockLocal}
          >
            <div className="deck-card-wrap" style={{ opacity: isMyTurn && !isGameFinished ? 1 : 0.65 }}>
              <div className="card-back">
                <div className="card-back-inner" />
              </div>
              <div className="deck-count">{state.drawPileCount}</div>
            </div>
          </button>

          <div className="discard-zone">
            <div className="discard-focus-ring" />
            <div className="discard-shadow-card one" />
            <div className="discard-shadow-card two" />
            <div className="discard-main">
              {state.discardTop ? (
                <Card card={state.discardTop} isPlayable={false} isInteractive={false} />
              ) : (
                <div className="card-back">
                  <div className="card-back-inner" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`active-color-chip color-${state.activeColor}`}>
          ACTIVE: {state.activeColor.toUpperCase()}
        </div>

        <div className="hand-zone">
          <div className="player-hand">
            {localPlayer?.hand && localPlayer.hand.length > 0 ? (
              localPlayer.hand.map((card, index) => {
                const count = localPlayer.hand.length;
                const offset = index - (count - 1) / 2;
                const rotate = Math.max(-12, Math.min(12, offset * 2.2));
                const rise = Math.abs(offset) * 1.7;

                return (
                  <div
                    key={card.id}
                    className="hand-card-wrap"
                    style={{
                      marginLeft: index === 0 ? 0 : -24,
                      transform: `translateY(${rise}px) rotate(${rotate}deg)`,
                    }}
                  >
                    <Card
                      card={card}
                      isPlayable={playableIds.has(card.id)}
                      isInteractive={isMyTurn && !isGameFinished}
                      selected={selectedCardId === card.id}
                      overlapOffset={0}
                      onClick={() => onCardClick(card)}
                    />
                  </div>
                );
              })
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
          {isMyTurn && state.hasDrawnThisTurn && !isGameFinished && (
            <div className="turn-actions">
              <button className="pass-btn" onClick={onPassTurn}>
                PASS TURN
              </button>
            </div>
          )}
          <div className="hand-label">YOUR HAND</div>
        </div>
      </div>

      {pendingWildCard && (
        <div className="wild-picker-backdrop">
          <div className="wild-picker">
            <div className="wild-title">Choose Color</div>
            <div className="wild-options">
              {(["red", "blue", "green", "yellow"] as ActiveColor[]).map((color) => (
                <button
                  key={color}
                  className={`wild-option color-${color}`}
                  onClick={() => playWildCardWithColor(color)}
                >
                  {color.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
