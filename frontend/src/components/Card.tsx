import { Card as CardType } from "../types/index";

interface CardProps {
  card: CardType;
  isPlayable: boolean;
  onClick?: () => void;
}

const colorMap: Record<string, string> = {
  red: "#FF6B6B",
  green: "#51CF66",
  blue: "#4DABF7",
  yellow: "#FFD93D",
};

export function Card({ card, isPlayable, onClick }: CardProps) {
  const bgColor = colorMap[card.color];

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      style={{
        width: "80px",
        height: "120px",
        backgroundColor: isPlayable ? "#F0FFE8" : "#FFFFFF",
        borderTopWidth: "4px",
        borderTopStyle: "solid",
        borderTopColor: bgColor,
        border: isPlayable ? `2px solid #51CF66` : `1px solid #E0E0E0`,
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "36px",
        fontWeight: "bold",
        color: "#333333",
        cursor: isPlayable ? "pointer" : "default",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        opacity: isPlayable ? 1 : 0.4,
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (isPlayable) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12)";
          el.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
        el.style.transform = "translateY(0)";
      }}
    >
      {card.number}
    </div>
  );
}
