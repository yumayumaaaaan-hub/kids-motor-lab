export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

/** P2 バッジ一覧（6種類） */
export const badges: Badge[] = [
  {
    id: 'first-writing',
    name: 'はじめて かけた',
    description: 'はじめて さいてん したよ',
    icon: '✏️',
  },
  {
    id: 'first-blueprint',
    name: 'はじめての せっけいず',
    description: 'せっけいずを 1まい ゲット',
    icon: '📄',
  },
  {
    id: 'first-car',
    name: 'はじめての くるま',
    description: 'くるまを 1だい かんせい',
    icon: '🚗',
  },
  {
    id: 'hanamaru-3',
    name: 'はなまる 3こ',
    description: '3つの もじで はなまる',
    icon: '🌸',
  },
  {
    id: 'cars-100',
    name: 'くるま 100だい',
    description: '外国車 100だい コンプリート',
    icon: '🎌',
  },
  {
    id: 'all-cars',
    name: 'くるま 200だい',
    description: '200だい ぜんぶ ゲット',
    icon: '🏆',
  },
  {
    id: 'practice-10',
    name: 'れんしゅう 10かい',
    description: 'さいてんを 10かい した',
    icon: '⭐',
  },
];

export function getBadgeById(id: string): Badge | undefined {
  return badges.find((badge) => badge.id === id);
}
