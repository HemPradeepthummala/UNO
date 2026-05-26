import { Card as CardType } from "../types/index";

interface CardProps {
  card: CardType;
  isPlayable: boolean;
  onClick?: () => void;
}

const colorMap: Record<string, { background: string; text: string }> = {
  red: { background: "#E03131", text: "#FFFFFF" },
  green: { background: "#2F9E44", text: "#FFFFFF" },
  blue: { background: "#1971C2", text: "#FFFFFF" },
  yellow: { background: "#FFD43B", text: "#1F2933" },
};

export function Card({ card, isPlayable, onClick }: CardProps) {
  const colors = colorMap[card.color];

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      style={{
        width: "80px",
        height: "120px",
        backgroundColor: colors.background,
        border: isPlayable
          ? "3px solid #FFFFFF"
          : "2px solid rgba(0, 0, 0, 0.12)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "36px",
        fontWeight: "bold",
        color: colors.text,
        cursor: isPlayable ? "pointer" : "default",
        boxShadow: isPlayable
          ? "0 0 0 3px #51CF66, 0 8px 18px rgba(0, 0, 0, 0.18)"
          : "0 4px 10px rgba(0, 0, 0, 0.12)",
        opacity: 1,
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (isPlayable) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow =
            "0 0 0 3px #51CF66, 0 12px 22px rgba(0, 0, 0, 0.22)";
          el.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = isPlayable
          ? "0 0 0 3px #51CF66, 0 8px 18px rgba(0, 0, 0, 0.18)"
          : "0 4px 10px rgba(0, 0, 0, 0.12)";
        el.style.transform = "translateY(0)";
      }}
    >
      {card.number}
    </div>
  );
}
