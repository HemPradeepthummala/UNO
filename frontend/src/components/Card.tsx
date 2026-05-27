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
  red: { background: "linear-gradient(160deg, #ff6156 0%, #d32626 100%)", text: "#FFFFFF" },
  green: { background: "linear-gradient(160deg, #42cf66 0%, #248640 100%)", text: "#FFFFFF" },
  blue: { background: "linear-gradient(160deg, #3ba3ff 0%, #1b67d6 100%)", text: "#FFFFFF" },
  yellow: { background: "linear-gradient(160deg, #ffd95a 0%, #f2a100 100%)", text: "#1f2933" },
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
        borderRadius: "11px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: typeof card.value === "number" ? "50px" : "30px",
        fontWeight: 900,
        lineHeight: 1,
        textShadow: "0 2px 4px rgba(0,0,0,0.35)",
        color: colors.text,
        cursor: isPlayable && isInteractive ? "pointer" : "default",
        marginLeft: overlapOffset ? `${overlapOffset}px` : 0,
        flexShrink: 0,
      }}
    >
      {cardLabel}
    </div>
  );
}
