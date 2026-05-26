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
  red: { background: "#f03e3e", text: "#FFFFFF" },
  green: { background: "#37b24d", text: "#FFFFFF" },
  blue: { background: "#228be6", text: "#FFFFFF" },
  yellow: { background: "#ffd43b", text: "#1F2933" },
  wild: { background: "#1e293b", text: "#FFFFFF" },
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
  const cardLabel =
    typeof card.value === "number"
      ? String(card.value)
      : card.value === "draw_two"
        ? "+2"
      : card.value === "skip"
        ? "SKIP"
        : card.value === "reverse"
          ? "REV"
          : card.value === "wild_draw_four"
            ? "W+4"
            : "WILD";
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
        width: "88px",
        height: "132px",
        background:
          card.color === "wild"
            ? "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)"
            : colors.background,
        border: "2px solid rgba(255, 255, 255, 0.7)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: typeof card.value === "number" ? "38px" : "24px",
        fontWeight: 700,
        color: colors.text,
        cursor: isPlayable && isInteractive ? "pointer" : "default",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.22)",
        marginLeft: overlapOffset ? `${overlapOffset}px` : 0,
        flexShrink: 0,
      }}
    >
      {cardLabel}
    </div>
  );
}
