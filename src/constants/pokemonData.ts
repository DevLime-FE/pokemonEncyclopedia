/**
 * 타입별 네온 테마 및 색상 정의
 */
export const typeThemes: Record<string, { main: string, neon: string }> = {
  normal: { main: '#A8A878', neon: 'rgba(168, 168, 120, 0.4)' },
  fire: { main: '#F08030', neon: 'rgba(240, 128, 48, 0.4)' },
  water: { main: '#6890F0', neon: 'rgba(104, 144, 240, 0.4)' },
  grass: { main: '#78C850', neon: 'rgba(120, 200, 80, 0.4)' },
  electric: { main: '#F8D030', neon: 'rgba(248, 208, 48, 0.4)' },
  ice: { main: '#98D8D8', neon: 'rgba(152, 216, 216, 0.4)' },
  fighting: { main: '#C03028', neon: 'rgba(192, 48, 40, 0.4)' },
  poison: { main: '#A040A0', neon: 'rgba(160, 64, 160, 0.4)' },
  ground: { main: '#E0C068', neon: 'rgba(224, 192, 104, 0.4)' },
  flying: { main: '#A890F0', neon: 'rgba(168, 144, 240, 0.4)' },
  psychic: { main: '#F85888', neon: 'rgba(248, 88, 136, 0.4)' },
  bug: { main: '#A8B820', neon: 'rgba(168, 184, 32, 0.4)' },
  rock: { main: '#B8A038', neon: 'rgba(184, 160, 56, 0.4)' },
  ghost: { main: '#705898', neon: 'rgba(112, 88, 152, 0.4)' },
  dragon: { main: '#7038F8', neon: 'rgba(112, 56, 248, 0.4)' },
  dark: { main: '#705848', neon: 'rgba(112, 88, 72, 0.4)' },
  steel: { main: '#B8B8D0', neon: 'rgba(184, 184, 208, 0.4)' },
  fairy: { main: '#EE99AC', neon: 'rgba(238, 153, 172, 0.4)' }
};

/**
 * 상성 차트 (공격 타입 -> 방어 타입: 배율)
 */
export const typeChart: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 0.5 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, water: 1, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};
