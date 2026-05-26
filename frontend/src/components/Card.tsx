import { Card as CardType } from "../types/index.ts";

interface CardProps {
  card: CardType;
  isPlayable: boolean;
  onClick?: () => void;
  selected?: boolean;
  isInteractive?: boolean;
  overlapOffset?: number;
}

const colorMap: Record<string, { background: string; text: string }> = {
  red: { background: "#E03131", text: "#FFFFFF" },
  green: { background: "#2F9E44", text: "#FFFFFF" },
  blue: { background: "#1971C2", text: "#FFFFFF" },
  yellow: { background: "#FFD43B", text: "#1F2933" },
};

export function Card({
  card,
  isPlayable,
  onClick,
  selected = false,
  isInteractive = true,
  overlapOffset = 0,
}: CardProps) {
  const colors = colorMap[card.color];
  const className = [
    "uno-card",
    isPlayable && isInteractive ? "playable" : "",
    selected ? "selected" : "",
    !isInteractive ? "inactive" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      onClick={isPlayable && isInteractive ? onClick : undefined}
      style={{
        width: "80px",
        height: "120px",
        backgroundColor: colors.background,
        border: "2px solid rgba(255, 255, 255, 0.7)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "36px",
        fontWeight: "bold",
        color: colors.text,
        cursor: isPlayable && isInteractive ? "pointer" : "default",
        boxShadow: "0 7px 14px rgba(0, 0, 0, 0.25)",
        marginLeft: overlapOffset ? `${overlapOffset}px` : 0,
        flexShrink: 0,
      }}
    >
      {card.number}
    </div>
  );
}
