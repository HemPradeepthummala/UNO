import { useContext } from "react";
import { GameContext, GameProvider } from "./context/GameContext";
import { useGameSocket } from "./socket/useGameSocket";
import { Card } from "./components/Card";

function GameBoard() {
  const { state } = useContext(GameContext);
  const { playCard, drawCard } = useGameSocket();

  const currentPlayer = state.players.find(
    (p) => p.id === state.currentPlayerId,
  );
  const localPlayer = state.players.find((p) => p.id === state.localPlayerId);
  const opponents = state.players.filter((p) => p.id !== localPlayer?.id);

  const isMyTurn = localPlayer && currentPlayer?.id === localPlayer.id;
  const isGameFinished = state.status === "finished";
  const winner = state.players.find((p) => p.id === state.winnerId);

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F5F5F5",
        color: "#333",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E0E0E0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: "600" }}>Uno Game</div>
        <div style={{ fontSize: "14px", color: "#666" }}>
          {state.status === "waiting"
            ? "Waiting for players..."
            : isGameFinished
              ? "Game Finished"
              : isMyTurn
                ? "Your Turn"
                : "Opponent's Turn"}
        </div>
      </div>

      <div
        style={{
          padding: "16px 20px",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E0E0E0",
          display: "flex",
          gap: "32px",
        }}
      >
        {opponents.map((opp) => (
          <div key={opp.id}>
            <div
              style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}
            >
              Player {opp.id}
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: currentPlayer?.id === opp.id ? "#4DABF7" : "#333",
              }}
            >
              {opp.hand.length} cards
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "48px",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{ fontSize: "12px", color: "#999", marginBottom: "12px" }}
          >
            Draw Pile
          </div>
          <button
            onClick={drawCard}
            disabled={!isMyTurn || isGameFinished}
            style={{
              width: "80px",
              height: "120px",
              backgroundColor: state.drawPileCount > 0 ? "#F0F0F0" : "#E8E8E8",
              border: "2px solid #D0D0D0",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: "600",
              color: "#666",
              cursor: isMyTurn && !isGameFinished ? "pointer" : "default",
              opacity: isMyTurn && !isGameFinished ? 1 : 0.5,
            }}
          >
            {state.drawPileCount}
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{ fontSize: "12px", color: "#999", marginBottom: "12px" }}
          >
            Discard Pile
          </div>
          {state.discardTop ? (
            <Card card={state.discardTop} isPlayable={false} />
          ) : (
            <div
              style={{
                width: "80px",
                height: "120px",
                backgroundColor: "#F0F0F0",
                border: "2px dashed #D0D0D0",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          )}
        </div>
      </div>

      {isGameFinished && winner && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#FFFFFF",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
            textAlign: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              marginBottom: "12px",
            }}
          >
            {winner.id === state.localPlayerId
              ? "You Won! 🎉"
              : `Player ${winner.id} Won`}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#666",
              marginTop: "16px",
            }}
          >
            Game Over
          </div>
        </div>
      )}

      <div
        style={{
          padding: "16px 20px",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #E0E0E0",
        }}
      >
        <div style={{ fontSize: "12px", color: "#999", marginBottom: "12px" }}>
          Your Hand
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            overflowX: "auto",
            paddingBottom: "8px",
          }}
        >
          {localPlayer?.hand && localPlayer.hand.length > 0 ? (
            localPlayer.hand.map((card) => (
              <Card
                key={card.id}
                card={card}
                isPlayable={localPlayer.playableCardIds.includes(card.id)}
                onClick={() => playCard(card.id)}
              />
            ))
          ) : (
            <div style={{ fontSize: "14px", color: "#999" }}>
              {state.status === "waiting" ? "Waiting for game..." : "No cards"}
            </div>
          )}
        </div>
      </div>
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
