export type CardColor = "red" | "green" | "blue" | "yellow";
export type ActionType = "draw_two" | "skip" | "reverse";
export type CardValue = number | ActionType;

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
}

export function createDeck(): Card[] {
  const colors: CardColor[] = ["red", "green", "blue", "yellow"];
  const cards: Card[] = [];

  for (const color of colors) {
    cards.push({
      id: `${color}-0-0`,
      color,
      value: 0,
    });

    for (let occurrence = 0; occurrence < 2; occurrence++) {
      for (let number = 1; number <= 9; number++) {
        cards.push({
          id: `${color}-${number}-${occurrence}`,
          color,
          value: number,
        });
      }

      cards.push({
        id: `${color}-draw-two-${occurrence}`,
        color,
        value: "draw_two",
      });
      cards.push({
        id: `${color}-skip-${occurrence}`,
        color,
        value: "skip",
      });
      cards.push({
        id: `${color}-reverse-${occurrence}`,
        color,
        value: "reverse",
      });
    }
  }

  return cards;
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function isPlayable(card: Card, topCard: Card): boolean {
  return card.color === topCard.color || card.value === topCard.value;
}
