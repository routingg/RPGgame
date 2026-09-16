# RPGgame — 로팅월드

작은 도트 마을을 탐험하고 짧은 놀이를 체험할 수 있는 브라우저 RPG 프로토타입이다. 현재 시작 화면, 봄들 마을 탐험, NPC 대화, `물방울 광장` 미니게임까지 구현되어 있다.

## 배포 버전

- 플레이: [로팅월드 배포 사이트](https://rotting-world-rpg.yujeonggg.chatgpt.site)
- 공개 상태: 소유자 전용
- 배포 기준 버전: `4de1174` (`Add Water Drop Square minigame`)

## 로컬 실행

Node.js 환경에서 `npm run dev`를 실행한 뒤 <http://127.0.0.1:4173>에 접속한다. 별도 npm 의존성 설치는 필요 없다.

## 마을 조작

- 방향키 / WASD: 이동
- E / Enter: 가까운 NPC와 대화, 대화 진행
- Esc: 대화 닫기 또는 게임 메뉴
- 상단의 물방울 아이콘: `물방울 광장` 입장
- 작은 화면: 화면의 방향 버튼과 상호작용 버튼 사용

## 물방울 광장

60초 안에 물풍선으로 나무 상자를 부수고 숨겨진 빛방울 3개를 찾는 1인용 미니게임이다.

- 방향키: 격자 이동
- Space 또는 `물풍선` 버튼: 현재 칸에 물풍선 설치
- 물풍선은 잠시 뒤 상하좌우 두 칸으로 터지며 단단한 벽에서 멈춘다.
- 물줄기에 두 번 맞거나 시간이 끝나면 실패한다.
- 빛방울 3개를 모으면 승리한다.

첫 인사 완료와 캐릭터 위치는 현재 페이지 세션 동안 유지되며 새로고침하면 초기화된다. 숲, 턴제 전투, 성장 시스템은 다음 개발 단계다.

## 검증

- `npm run check`: 마을과 미니게임 JavaScript 문법 확인
- `npm test`: 이동·충돌·대화 상태와 물풍선·상자·피격·제한 시간·실제 완주 경로 검사
- 현재 자동 검사 15개 통과
- 브라우저에서 시작 화면, 마을, 미니게임 진입과 플레이 화면 확인

## 구조

- `dist/game-core.js`: 마을 충돌과 플레이 상태
- `dist/bubble-core.js`: 물방울 광장 규칙과 상태
- `dist/app.js`: 캔버스 렌더링, 입력, 화면, WebMCP 도구
- `dist/index.html`, `dist/style.css`: 시작·탐험·대화·미니게임 UI
- `tests/village.test.mjs`: 마을 이동과 대화 검사
- `tests/bubble.test.mjs`: 미니게임 규칙과 완주 경로 검사
- `PRD.md`, `TODO.md`: 기획과 작업 현황

## 그림 출처

Kenney의 [Tiny Town](https://kenney.nl/assets/tiny-town), [Tiny Dungeon](https://kenney.nl/assets/tiny-dungeon). 모두 CC0이며 원본 라이선스는 `dist/assets/town-LICENSE.txt`, `dist/assets/characters-LICENSE.txt`에 포함되어 있다.
