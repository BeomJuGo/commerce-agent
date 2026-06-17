# AI 커머스 에이전트

자연어 입력 기반으로 상품 탐색·추천·비교·구매판단·고객응대·데이터 구조화를 해주는 **AI 커머스 에이전트** 서비스입니다.
Next.js(App Router) 풀스택 단일 프로젝트로, 네이버 쇼핑 API와 OpenAI를 결합해 8가지 커머스 도구를 제공합니다.

## 기능

| 경로 | 기능 | API |
| --- | --- | --- |
| `/recommend` | 상황 기반 상품 추천 | `POST /api/recommend` |
| `/compare` | 상품 비교·구매 판단 | `POST /api/compare` |
| `/review` | 리뷰 요약·장단점 분석 (Mongo 캐시) | `POST /api/review` |
| `/widget` · `/widget-demo` | 쇼핑몰 고객 응대 AI 위젯 | `POST /api/chat` |
| `/dashboard` | 대화 로그 기반 고객 니즈 분석 (관리자) | `GET /api/dashboard` |
| `/sourcing` | 상품 소싱 아이디어 추천 | `POST /api/sourcing` |
| `/links` | 쿠팡/자사몰 링크 관리 (URL 붙여넣기 → OG 보강, CRUD) | `GET/POST/DELETE /api/links` |
| `/curation` | 여행/계절/라이프스타일 큐레이션 | `POST /api/curation` |

공통 흐름: **자연어 입력 → GPT로 의도/키워드 추출 → 네이버 쇼핑 검색 → GPT로 정렬/요약/판단 → 결과 반환(+필요 시 MongoDB 저장)**.

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local   # 키 입력
npm run dev
```

### 환경변수

| 키 | 설명 | 필수 |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB Atlas 연결 문자열 | 링크/대시보드/캐시에 필요 |
| `MONGODB_DB` | DB 이름 (URI에 없을 때) | 선택 |
| `OPENAI_API_KEY` | OpenAI API 키 | 필수 |
| `OPENAI_MODEL` | 기본 `gpt-5.5` | 선택 |
| `NAVER_CLIENT_ID` | 네이버 개발자센터 검색 API | 필수 |
| `NAVER_CLIENT_SECRET` | 네이버 검색 API 시크릿 | 필수 |
| `ADMIN_API_KEY` | 관리자 로그인 비밀번호 겸 `/api/dashboard` Bearer 키 | 대시보드에 필요 |
| `ADMIN_PASSWORD` | 관리자 로그인 비밀번호(미설정 시 `ADMIN_API_KEY` 사용) | 선택 |
| `SESSION_SECRET` | 세션 쿠키 서명 키(미설정 시 `ADMIN_API_KEY` 사용) | 선택 |

> MongoDB 미설정 시: `links`/`dashboard`는 503으로 응답하고, `review` 캐시·`chat` 로그는 조용히 skip하며 본 기능은 동작합니다(graceful degradation).

## Vercel 배포

1. 이 저장소를 Vercel에 임포트합니다.
2. **Root Directory**는 저장소 루트(이 폴더)로 둡니다.
3. 위 환경변수 7종을 등록합니다.
4. 배포 후, `public/widget.js` 삽입 스니펫의 도메인을 실제 Vercel 도메인으로 안내합니다.

API 라우트는 mongodb 드라이버를 사용하므로 Node.js 런타임에서 실행됩니다(`export const runtime = "nodejs"`).

### 레이트리밋 / 보안

모든 `/api` 라우트에 IP 기반 경량 레이트리밋(`lib/rateLimit.js`)이 적용되어 있습니다(GPT 라우트 10/분, dashboard 20/분, links 30/분). 공유 OpenAI·네이버 키 할당량을 캐주얼 남용으로부터 보호하기 위한 1차 방어선입니다.

> 서버리스에서는 인스턴스별 인메모리라 **best-effort**입니다. 트래픽이 많거나 하드 제한이 필요하면 **Vercel WAF rate rules**를 함께 사용하세요. 키 노출 위험이 크면 이 프로젝트 전용 OpenAI/네이버 키를 별도 발급하는 것을 권장합니다.

### 관리자 로그인

`/dashboard` 등 관리자 기능은 로그인 후에만 접근할 수 있습니다.

- `/login`에서 비밀번호 입력 → 검증 시 서명된 httpOnly 세션 쿠키(24h) 발급
- `proxy.js`(Next.js Proxy)가 `/dashboard` 접근을 가로채 미인증 시 `/login`으로 리다이렉트
- 비밀번호는 `ADMIN_PASSWORD`(없으면 `ADMIN_API_KEY`), 쿠키 서명은 `SESSION_SECRET`(없으면 `ADMIN_API_KEY`)
- `/api/dashboard`는 세션 쿠키 **또는** `Authorization: Bearer <ADMIN_API_KEY>`(프로그램 접근) 허용

## 고객 응대 위젯 삽입

임의의 쇼핑몰 HTML에 아래 한 줄을 추가하면 우하단에 AI 상담 챗봇이 떠 응대합니다.

```html
<script src="https://commerce-agent-ecru.vercel.app/widget.js" data-shop="내 쇼핑몰 이름"></script>
```

> 라이브: **https://commerce-agent-ecru.vercel.app** · `/widget-demo`에서 실제 위젯과 자동 생성된 스니펫을 확인할 수 있습니다.

## 기술 스택

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · MongoDB · zod · winston · recharts · 네이버 쇼핑 API · OpenAI

디자인: 다크 프리미엄 + 오렌지(#ff5c1a) 단일 악센트, Pretendard + JetBrains Mono, 모노스페이스 악센트(ZERO STUDIO 톤).
