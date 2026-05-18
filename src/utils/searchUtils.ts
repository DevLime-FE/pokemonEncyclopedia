const CHO_INITIALS = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

/**
 * 대상 문자열이 검색 쿼리(초성 포함)와 일치하는지 확인합니다.
 * "ㄱㄹㄷㅅ", "갸ㄹㄷㅅ" -> "갸라도스" 매칭 지원.
 */
export function matchChosung(target: string, query: string): boolean {
  if (!query) return true;
  
  // 일반적인 대소문자 무시 포함 검색 (가장 빠르고 기본)
  if (target.toLowerCase().includes(query.toLowerCase())) return true;

  try {
    const regexPattern = query.split('').map(c => {
      // 초성인지 확인
      const choIndex = CHO_INITIALS.indexOf(c);
      if (choIndex !== -1) {
        // 초성에 해당하는 가~깋 형태의 유니코드 범위 계산
        const begin = 44032 + choIndex * 588;
        const end = begin + 587;
        return `[${c}\\u${begin.toString(16)}-\\u${end.toString(16)}]`;
      }
      // 특수문자 정규식 이스케이프
      return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('');
    
    const regex = new RegExp(regexPattern, 'i');
    return regex.test(target);
  } catch (e) {
    return false;
  }
}
