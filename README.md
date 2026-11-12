# 자취방 계약서 프론트

Spring Boot `/api/v1`에 붙는 React 화면입니다. 기본값은 목업이라 서버 없이 흐름을 볼 수 있습니다.

```bash
npm install
npm run dev
```

## 백엔드와 합칠 때

브라우저에 모델 키나 AWS 키를 넣지 않습니다. `VITE_USE_MOCK=false`로 빌드하고, nginx가 같은 사이트에서 아래 경로만 Spring으로 넘깁니다.

- `/api/`
- `/oauth2/`
- `/login/oauth2/`

화면의 `/login`은 프론트 라우트라 Spring으로 넘기면 안 됩니다. 개발 서버도 `vite.config.ts`에서 같은 방식으로 프록시합니다. API 주소는 비워 두고 같은 출처로 호출합니다.

인증은 `SESSION` 쿠키와 `X-XSRF-TOKEN`입니다. 앱이 켜질 때 `GET /api/v1/auth/csrf`를 호출합니다.

토스 결제창은 `VITE_TOSS_CLIENT_KEY`, 웹 푸시는 `VITE_VAPID_PUBLIC_KEY`가 있을 때만 실제 SDK와 Service Worker를 사용합니다. 없으면 목업 결제창과 목업 구독으로 동작합니다.

## 화면이 가정하는 응답

스펙 시트 안에서 이름이 갈린 필드는 아래로 읽습니다. `src/api/normalize.ts`가 일부 다른 이름도 받아 줍니다.

- 식별자는 `contractId`, `clauseId`, `analysisId`
- 목록에 계약 유형과 `overallScore`(0~100)
- 조항 확률 `score`는 0~1, 일정 날짜는 `dueDate`
- 계약 상태 `UPLOADED` `OCR` `SPLIT` `ANALYZING` `ANALYZED` `FAILED`
- 위험 등급 `HIGH` `CAUTION` `SAFE`
- 결제 완료 `DONE`

분석 상세는 분석을 시작한 응답의 `analysisId`로 `GET /analyses/{id}`를 호출할 때만 엽니다. 계약서 조회에 최신 분석 번호가 없으면, 화면을 다시 열 때 조항별 확률은 다시 그리지 않습니다.
