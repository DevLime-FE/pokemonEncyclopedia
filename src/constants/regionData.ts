export interface RegionStaticData {
  id: string;
  nameKey: string;
  descKey: string;
  starters: number[]; // Grass, Fire, Water
  bgUrl: string;
}

export const REGION_DATA: Record<string, RegionStaticData> = {
  kanto: {
    id: 'kanto',
    nameKey: 'Kanto',
    descKey: 'desc_kanto',
    starters: [1, 4, 7],
    bgUrl: '/backgrounds/bg_kanto.png'
  },
  johto: {
    id: 'johto',
    nameKey: 'Johto',
    descKey: 'desc_johto',
    starters: [152, 155, 158],
    bgUrl: '/backgrounds/bg_johto.png'
  },
  hoenn: {
    id: 'hoenn',
    nameKey: 'Hoenn',
    descKey: 'desc_hoenn',
    starters: [252, 255, 258],
    bgUrl: '/backgrounds/bg_hoenn.png'
  },
  sinnoh: {
    id: 'sinnoh',
    nameKey: 'Sinnoh',
    descKey: 'desc_sinnoh',
    starters: [387, 390, 393],
    bgUrl: '/backgrounds/bg_sinnoh.png'
  },
  unova: {
    id: 'unova',
    nameKey: 'Unova',
    descKey: 'desc_unova',
    starters: [495, 498, 501],
    bgUrl: '/backgrounds/bg_unova.png'
  },
  kalos: {
    id: 'kalos',
    nameKey: 'Kalos',
    descKey: 'desc_kalos',
    starters: [650, 653, 656],
    bgUrl: '/backgrounds/bg_kalos.png'
  },
  alola: {
    id: 'alola',
    nameKey: 'Alola',
    descKey: 'desc_alola',
    starters: [722, 725, 728],
    bgUrl: '/backgrounds/bg_alola.png'
  },
  galar: {
    id: 'galar',
    nameKey: 'Galar',
    descKey: 'desc_galar',
    starters: [810, 813, 816],
    bgUrl: '/backgrounds/bg_galar.png'
  },
  paldea: {
    id: 'paldea',
    nameKey: 'Paldea',
    descKey: 'desc_paldea',
    starters: [906, 909, 912],
    bgUrl: '/backgrounds/bg_paldea.png'
  }
};
