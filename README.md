# RPGgame — 로팅월드

작은 도트 마을을 탐험하는 브라우저 RPG 프로토타입. 현재 Phase 1까지 구현되어 있다.

## 실행

Node.js 환경에서 `npm run dev`를 실행한 뒤 http://127.0.0.1:4173 에 접속한다. 별도 npm 의존성 설치는 필요 없다.

## 조작

- 방향키 / WASD: 이동
- E / Enter: 가까운 NPC와 대화, 대화 진행
- Esc: 대화 닫기 또는 게임 메뉴
- 작은 화면: 하단 방향 버튼을 누르고 이동, 대화하기 버튼으로 상호작용

첫 인사 완료와 캐릭터 위치는 현재 페이지 세션 동안 유지된다. 새로고침 시 초기화된다. 건물 내부·숲·전투·성장은 다음 단계다.

## 검증

- `npm run check`: JavaScript 문법 확인
- `npm test`: 이동 정규화, 장애물·경계 충돌, 긴 프레임 처리, NPC 접근, 대화 이동 잠금, 완료·재대화, 일시정지, 시작 화면 복귀 검사
- 브라우저: 시작→접근→대화 완료, 대화 버튼·E 키, 재대화, 좁은 화면, 런타임 오류 확인

## 구조

- `dist/game-core.js`: 맵 충돌과 플레이 상태
- `dist/app.js`: 타일 렌더링, 입력, 화면, WebMCP 도구
- `dist/index.html`, `dist/style.css`: 시작·탐험·대화 UI
- `tests/village.test.mjs`: 상태와 이동 검사
- `PRD.md`, `TODO.md`: 기획과 작업 현황

## 그림 출처

Kenney의 [Tiny Town](https://kenney.nl/assets/tiny-town), [Tiny Dungeon](https://kenney.nl/assets/tiny-dungeon). 모두 CC0. 원본 라이선스는 `dist/assets/town-LICENSE.txt`, `dist/assets/characters-LICENSE.txt`에 포함되어 있다.
