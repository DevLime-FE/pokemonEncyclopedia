# 포켓몬 배틀 시뮬레이터 (Pokemon Battle Simulator)

PokeAPI를 활용하여 포켓몬 정보를 조회하고 배틀 시뮬레이션을 진행할 수 있는 고성능 웹 프로젝트입니다. 프리미엄 터미널 스타일의 인터페이스와 다국어 기능을 지원합니다.

## 📸 주요 화면 (Screenshots)

<table align="center">
  <tr>
    <td align="center"><b>메인 터미널</b><br/><img src="public/screenshots/home.png" width="400"/></td>
    <td align="center"><b>포켓몬 섹터 선택</b><br/><img src="public/screenshots/region.png" width="400"/></td>
  </tr>
  <tr>
    <td align="center"><b>커스텀 기술 로드아웃</b><br/><img src="public/screenshots/moves.png" width="400"/></td>
    <td align="center"><b>배틀 시뮬레이션</b><br/><img src="public/screenshots/battle.png" width="400"/></td>
  </tr>
</table>

## 🛠 주요 기능

*   **배틀 시뮬레이션**: 턴제 기반의 1:1 포켓몬 배틀 (공격 애니메이션, 데미지 팝업, 쓰러짐 연출 등 포함)
*   **백과사전 검색 (Pokedex Search)**: 전 세계 포켓몬 및 기술 데이터를 실시간으로 조회하는 통합 검색 엔진
*   **로드아웃 커스터마이징**: 포켓몬의 기술 배치를 직접 선택하고 전략을 구성하는 'Define Protocol' 시스템
*   **Neural-Link (속도 측정)**: 실제 API 서버와의 통신 상태를 체크하는 대기 시간 및 다운로드 속도 측정 기능
*   **다국어 지원 (i18n)**: 한국어(Pretendard), 영어, 일본어 지원 (각 언어별 최적화된 폰트 적용)
*   **반응형 레이아웃**: 데스크탑 및 모바일 환경에 최적화된 하이테크 터미널 UI

## 💻 기술 스택

*   **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
*   **Font System**: Pretendard Variable (KR), Press Start 2P (Mono)
*   **Internationalization**: react-i18next
*   **API Interface**: PokeAPI (Official v2)

## ⚙️ 실행 방법

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```