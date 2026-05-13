import { typeChart } from "../constants/pokemonData";

/**
 * 공격 타입과 방어 포켓몬의 타입들을 바탕으로 데미지 배율을 계산합니다.
 * @param attackType 공격 기술의 타입
 * @param defenderTypes 방어측 포켓몬의 타입 배열
 * @returns 계산된 데미지 배율
 */
export const getMultiplier = (attackType: string, defenderTypes: string[]) => {
  let multiplier = 1;
  defenderTypes.forEach(dType => {
    if (typeChart[attackType] && typeChart[attackType][dType] !== undefined) {
      multiplier *= typeChart[attackType][dType];
    }
  });
  return multiplier;
};


/**
 * 데미지를 계산합니다.
 * @param power 기술 위력
 * @param attackerAtk 공격자 공격력
 * @param defenderDef 방어자 방어력
 * @param multiplier 타입 배율
 * @param isStab 자속 보정 여부 (Same Type Attack Bonus)
 * @returns 최종 데미지
 */
export const calculateDamage = (
  power: number,
  attackerAtk: number,
  defenderDef: number,
  multiplier: number,
  isStab: boolean = false
) => {
  const stabBonus = isStab ? 1.5 : 1;
  return Math.max(1, Math.floor(((power * attackerAtk / defenderDef) / 2) * multiplier * stabBonus));
};

/**
 * 포켓몬의 특정 스탯 값을 가져옵니다.
 */
export const getStatValue = (pokemon: any, statName: string) =>
  pokemon?.stats?.find((s: any) => s.stat.name === statName)?.base_stat || 0;

/**
 * HP 퍼센트를 계산합니다.
 */
export const getHpPercentage = (currentHp: number, maxHp: number) =>
  Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

/**
 * HP 퍼센트에 따른 색상 클래스를 반환합니다.
 */
export const getHpColor = (percentage: number) => {
  if (percentage > 50) return 'bg-green-400 shadow-[0_0_10px_#4ade80]';
  if (percentage > 20) return 'bg-yellow-400 shadow-[0_0_10px_#facc15]';
  return 'bg-red-500 shadow-[0_0_10px_#ef4444]';
};

