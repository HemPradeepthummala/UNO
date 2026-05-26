export type CardColor = "red" | "green" | "blue" | "yellow";

export interface Card {
  id: string;
  color: CardColor;
  number: number;
}

export function createDeck(): Card[] {
  const colors: CardColor[] = ["red", "green", "blue", "yellow"];
  const cards: Card[] = [];

  for (const color of colors) {
    cards.push({
      id: `${color}-0-0`,
      color,
      number: 0,
    });

    for (let occurrence = 0; occurrence < 2; occurrence++) {
      for (let number = 1; number <= 9; number++) {
        cards.push({
          id: `${color}-${number}-${occurrence}`,
          color,
          number,
        });
      }
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
  return card.color === topCard.color || card.number === topCard.number;
}
