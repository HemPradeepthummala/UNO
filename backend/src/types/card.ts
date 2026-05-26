export type CardColor = "red" | "green" | "blue" | "yellow";

export interface Card {
  id: string;
  color: CardColor;
  number: number;
}

export function createDeck(): Card[] {
  const colors: CardColor[] = ["red", "green", "blue", "yellow"];
  const cards: Card[] = [];
  let cardId = 0;

  for (const color of colors) {
    cards.push({
      id: `card_${cardId++}`,
      color,
      number: 0,
    });

    for (let i = 0; i < 2; i++) {
      for (let number = 1; number <= 9; number++) {
        cards.push({
          id: `card_${cardId++}`,
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
