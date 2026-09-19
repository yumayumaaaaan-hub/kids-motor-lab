export type SpecialChallenge = {
  id: string;
  unlockAtCarCount: number;
  word: string;
  characters: readonly string[];
  car: {
    manufacturer: string;
    name: string;
    imagePath: string;
  };
};

/** 通常車10台ごとに開くスペシャルチャレンジ */
export const specialChallenges: readonly SpecialChallenge[] = [
  {
    id: 'special-01',
    unlockAtCarCount: 10,
    word: 'せかいいち',
    characters: ['せ', 'か', 'い', 'い', 'ち'],
    car: {
      manufacturer: 'Bugatti',
      name: 'Chiron Gold Edition',
      imagePath: '/special-cars/001.png',
    },
  },
  {
    id: 'special-02',
    unlockAtCarCount: 20,
    word: 'ゆめをみる',
    characters: ['ゆ', 'め', 'を', 'み', 'る'],
    car: {
      manufacturer: 'Lamborghini',
      name: 'Countach',
      imagePath: '/special-cars/002.png',
    },
  },
  {
    id: 'special-03',
    unlockAtCarCount: 30,
    word: 'ほしのゆめ',
    characters: ['ほ', 'し', 'の', 'ゆ', 'め'],
    car: {
      manufacturer: 'Ferrari',
      name: 'F40',
      imagePath: '/special-cars/003.png',
    },
  },
  {
    id: 'special-04',
    unlockAtCarCount: 40,
    word: 'みらいへと',
    characters: ['み', 'ら', 'い', 'へ', 'と'],
    car: {
      manufacturer: 'McLaren',
      name: 'F1',
      imagePath: '/special-cars/004.png',
    },
  },
  {
    id: 'special-05',
    unlockAtCarCount: 50,
    word: 'ひかりさす',
    characters: ['ひ', 'か', 'り', 'さ', 'す'],
    car: {
      manufacturer: 'Porsche',
      name: '918 Spyder',
      imagePath: '/special-cars/005.png',
    },
  },
  {
    id: 'special-06',
    unlockAtCarCount: 60,
    word: 'はしるゆめ',
    characters: ['は', 'し', 'る', 'ゆ', 'め'],
    car: {
      manufacturer: 'Pagani',
      name: 'Huayra',
      imagePath: '/special-cars/006.png',
    },
  },
  {
    id: 'special-07',
    unlockAtCarCount: 70,
    word: 'ゆめのつき',
    characters: ['ゆ', 'め', 'の', 'つ', 'き'],
    car: {
      manufacturer: 'Koenigsegg',
      name: 'Jesko',
      imagePath: '/special-cars/007.png',
    },
  },
  {
    id: 'special-08',
    unlockAtCarCount: 80,
    word: 'ほしをみる',
    characters: ['ほ', 'し', 'を', 'み', 'る'],
    car: {
      manufacturer: 'Aston Martin',
      name: 'Valkyrie',
      imagePath: '/special-cars/008.png',
    },
  },
  {
    id: 'special-09',
    unlockAtCarCount: 90,
    word: 'みちをゆく',
    characters: ['み', 'ち', 'を', 'ゆ', 'く'],
    car: {
      manufacturer: 'Mercedes-AMG',
      name: 'ONE',
      imagePath: '/special-cars/009.png',
    },
  },
  {
    id: 'special-10',
    unlockAtCarCount: 100,
    word: 'せかいへと',
    characters: ['せ', 'か', 'い', 'へ', 'と'],
    car: {
      manufacturer: 'Rimac',
      name: 'Nevera',
      imagePath: '/special-cars/010.png',
    },
  },
  {
    id: 'special-11',
    unlockAtCarCount: 110,
    word: 'そらをみる',
    characters: ['そ', 'ら', 'を', 'み', 'る'],
    car: {
      manufacturer: 'Ferrari',
      name: 'LaFerrari',
      imagePath: '/special-cars/011.png',
    },
  },
  {
    id: 'special-12',
    unlockAtCarCount: 120,
    word: 'あしたへと',
    characters: ['あ', 'し', 'た', 'へ', 'と'],
    car: {
      manufacturer: 'Lamborghini',
      name: 'Revuelto',
      imagePath: '/special-cars/012.png',
    },
  },
  {
    id: 'special-13',
    unlockAtCarCount: 130,
    word: 'ほしへいく',
    characters: ['ほ', 'し', 'へ', 'い', 'く'],
    car: {
      manufacturer: 'Bugatti',
      name: 'Divo',
      imagePath: '/special-cars/013.png',
    },
  },
  {
    id: 'special-14',
    unlockAtCarCount: 140,
    word: 'まえをみる',
    characters: ['ま', 'え', 'を', 'み', 'る'],
    car: {
      manufacturer: 'McLaren',
      name: 'P1',
      imagePath: '/special-cars/014.png',
    },
  },
  {
    id: 'special-15',
    unlockAtCarCount: 150,
    word: 'ゆめへいく',
    characters: ['ゆ', 'め', 'へ', 'い', 'く'],
    car: {
      manufacturer: 'Porsche',
      name: 'Carrera GT',
      imagePath: '/special-cars/015.png',
    },
  },
  {
    id: 'special-16',
    unlockAtCarCount: 160,
    word: 'きんのほし',
    characters: ['き', 'ん', 'の', 'ほ', 'し'],
    car: {
      manufacturer: 'Pagani',
      name: 'Zonda',
      imagePath: '/special-cars/016.png',
    },
  },
  {
    id: 'special-17',
    unlockAtCarCount: 170,
    word: 'そらへいく',
    characters: ['そ', 'ら', 'へ', 'い', 'く'],
    car: {
      manufacturer: 'Koenigsegg',
      name: 'Regera',
      imagePath: '/special-cars/017.png',
    },
  },
  {
    id: 'special-18',
    unlockAtCarCount: 180,
    word: 'きみとゆく',
    characters: ['き', 'み', 'と', 'ゆ', 'く'],
    car: {
      manufacturer: 'Gordon Murray',
      name: 'T.50',
      imagePath: '/special-cars/018.png',
    },
  },
  {
    id: 'special-19',
    unlockAtCarCount: 190,
    word: 'はやくゆく',
    characters: ['は', 'や', 'く', 'ゆ', 'く'],
    car: {
      manufacturer: 'Lotus',
      name: 'Evija',
      imagePath: '/special-cars/019.png',
    },
  },
  {
    id: 'special-20',
    unlockAtCarCount: 200,
    word: 'そらのはて',
    characters: ['そ', 'ら', 'の', 'は', 'て'],
    car: {
      manufacturer: 'Hennessey',
      name: 'Venom F5',
      imagePath: '/special-cars/020.png',
    },
  },
] as const;

export const SPECIAL_CAR_COUNT = specialChallenges.length;

export function getSpecialChallengeById(
  challengeId: string,
): SpecialChallenge | undefined {
  return specialChallenges.find((challenge) => challenge.id === challengeId);
}

/** 獲得済みのスペシャル車の台数 */
export function getUnlockedSpecialCarCount(progress: {
  specialChallenges: Record<string, { unlocked: boolean }>;
}): number {
  return specialChallenges.filter(
    (challenge) => progress.specialChallenges[challenge.id]?.unlocked === true,
  ).length;
}

