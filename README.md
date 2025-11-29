# GenOn 🎮

GenOn은 MZ 세대와 시니어 세대가 실시간으로 퀴즈 대결을 벌이는 게임 플랫폼입니다. WebSocket을 통한 실시간 매칭 및 게임 진행을 지원하며, 랭킹 시스템과 상세한 문제 해설을 제공합니다.

## ✨ 주요 기능

### 1. 인증 시스템

- 회원가입 및 로그인
- JWT 기반 인증 (AccessToken)
- 로그인 상태 유지

### 2. 실시간 매칭 시스템

- WebSocket 기반 실시간 매칭
- MZ ↔ 시니어 자동 매칭
- 매칭 수락/거절 기능
- 매칭 대기 상태 표시

### 3. 퀴즈 게임 (1 vs 1)

- 5라운드 퀴즈 대결
- 문제당 10초 제한시간
- 실시간 점수 업데이트
- 정답/오답 즉시 피드백
- 상대방 답변 완료까지 대기

### 4. 랭킹 시스템

- 전체 사용자 랭킹 조회
- 등급별 표시 (BRONZE, SILVER, GOLD 등)
- 세대별 역할 표시 (MZ, SENIOR)

### 5. 결과 화면

- 최종 점수 및 승자 표시
- 문제별 상세 해설
- 정답 및 해설 제공

## 🛠️ 기술 스택

### Frontend

- **React 19.2.0** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **React Router DOM** - 클라이언트 사이드 라우팅
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크

### State Management & Data Fetching

- **TanStack React Query** - 서버 상태 관리 및 데이터 페칭
- **Axios** - HTTP 클라이언트

### Real-time Communication

- **WebSocket** - 실시간 양방향 통신

## 📁 프로젝트 구조

```
GenOn/
├── src/
│   ├── apis/              # API 인스턴스 설정
│   │   └── instance.ts
│   ├── components/        # 재사용 가능한 컴포넌트
│   │   └── Header.tsx
│   ├── constants/         # 상수 정의
│   │   └── ranking.ts
│   ├── hooks/             # Custom React Hooks
│   │   ├── quiz.ts        # 퀴즈 데이터 조회
│   │   └── user.ts        # 사용자 관련 데이터
│   ├── pages/             # 페이지 컴포넌트
│   │   ├── Login.tsx      # 로그인 페이지
│   │   ├── SignUp.tsx     # 회원가입 페이지
│   │   ├── Main.tsx       # 메인 페이지 (랭킹, 매칭)
│   │   ├── Quiz.tsx       # 퀴즈 게임 페이지
│   │   └── Result.tsx     # 결과 페이지
│   ├── types/             # TypeScript 타입 정의
│   │   └── profile.ts
│   ├── utils/             # 유틸리티 함수
│   │   ├── instance.ts
│   │   └── websocket.ts   # WebSocket 관리
│   ├── App.tsx            # 라우팅 설정
│   ├── main.tsx           # 애플리케이션 진입점
│   └── index.css          # 전역 스타일
├── public/                # 정적 파일
└── package.json
```

## 🚀 시작하기

### 사전 요구사항

- Node.js (v18 이상 권장)
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` (또는 Vite가 할당한 포트)로 접속하세요.

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 미리보기

```bash
npm run preview
```

## 🎯 주요 기능 상세

### WebSocket 메시지 프로토콜

#### 클라이언트 → 서버

1. **MATCH_JOIN** - 매칭 시작

```json
{
  "type": "MATCH_JOIN"
}
```

2. **MATCH_ACCEPT** - 매칭 수락/거절

```json
{
  "type": "MATCH_ACCEPT",
  "quizId": "string",
  "accept": true
}
```

3. **ANSWER_SUBMIT** - 답변 제출

```json
{
  "type": "ANSWER_SUBMIT",
  "quizId": "string",
  "questionId": number,
  "answerIndex": number  // 0-3 (4지선다), -1 (시간 초과)
}
```

#### 서버 → 클라이언트

1. **MATCH_FOUND** - 매칭 성공
2. **MATCH_ACCEPTED** - 매칭 수락됨
3. **MATCH_REJECTED** - 매칭 거절됨
4. **GAME_START** - 게임 시작 (문제 목록 포함)
5. **ANSWER_RESULT** - 답변 결과
6. **ANSWER_DONE** - 게임 종료

### 게임 플로우

1. **로그인** → AccessToken 발급 및 WebSocket 연결
2. **메인 페이지** → 랭킹 조회 및 매칭 시작
3. **매칭 대기** → 상대방 매칭 완료 시 수락/거절 팝업
4. **게임 시작** → 5라운드 퀴즈 진행
   - 문제당 10초 제한
   - 답변 선택 시 자동 제출 (10초 후)
   - 시간 초과 시 -1 제출
5. **결과 화면** → 최종 점수 및 문제별 해설

## 📝 개발 가이드

### 코드 스타일

- ESLint를 사용한 코드 품질 관리
- TypeScript strict 모드 활성화
- 함수형 컴포넌트 및 React Hooks 사용

### API 호출

React Query를 사용한 서버 상태 관리:

```typescript
// 예시: 랭킹 데이터 조회
const ranking = useRanking();
```

### WebSocket 사용

```typescript
import { getWS, send } from "../utils/websocket";

// WebSocket 연결
const ws = getWS();

// 메시지 전송
send({
  type: "MATCH_JOIN",
});

// 메시지 수신은 각 페이지의 useEffect에서 처리
```

## 🐛 문제 해결

### WebSocket 연결 실패

- `accessToken`이 localStorage에 저장되어 있는지 확인
- 서버 주소가 올바른지 확인 (`VITE_WS_URL`)

### API 호출 실패

- 서버가 실행 중인지 확인
- `VITE_API_BASE_URL` 환경 변수 확인
- CORS 설정 확인

## 📄 라이선스

이 프로젝트는 팀 프로젝트입니다.

## 👥 팀원

- 차현우
- 곽문수
- 양우현

---

**GenOn** - 세대 간 소통을 위한 퀴즈 게임 플랫폼 🎯
