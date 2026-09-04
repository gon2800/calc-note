# calc-note 디자인 시스템 준수 점검 리포트

- 점검 일시: 2026-09-04
- 점검자: `design-check` 서브에이전트
- 기준 문서: OohInsightLab DESIGN.md — https://raw.githubusercontent.com/gon2800/design/main/DESIGN.md (main 브랜치, WebFetch로 당일 조회, 커밋 해시 확인 불가)
- 대상 파일:
  - `/home/gon/calc-note/index.html` (단일 파일, 1655줄)
  - `/home/gon/calc-note/manifest.webmanifest`
- 점검 범위: 색상 토큰, 탭 네비게이션(견출지) 스타일, Tabler Icons 사용 규칙, DESIGN.md 명시 레이아웃/치수 제약
- 범위 외(보고하지 않음): 성능, 파일 용량, PWA/서비스워커 유효성, 모바일 터치/키보드 UX

---

## 요약 (심각도 순)

| # | 심각도 | 내용 | 위치 |
|---|--------|------|------|
| 1 | 중간 | manifest `theme_color`가 `#5B54E8`(accent) — DESIGN.md 및 HTML meta `theme-color`(`#F5F6FB`)와 불일치 | manifest.webmanifest:8 |
| 2 | 중간 | safe-area-inset이 상단만 처리, 하단/좌우 미적용 (DESIGN.md "notched devices 필수") | index.html:45-46, 96 |
| 3 | 중간 | 입력 필드 치수가 DESIGN 규격(높이 40px·폰트 15px·2px accent 보더)에서 이탈 | index.html:143-148, 155-165, 198-221 |
| 4 | 낮음 | 토큰 대신 하드코딩된 색상 리터럴 사용(`rgba(91,84,232,…)`, `#fff`) | index.html:25-28, 145, 227, 339 |
| 5 | 낮음 | `--radius:18px`/규격 외 border-radius 값 산재(13px, 12px, 9px, 8px) | index.html:50, 180, 189-193, 232, 291, 320-326 |
| 6 | 낮음 | 환율 통화 선택·퀵그리드에 국기 이모지 사용(DESIGN "no emoji"는 탭 한정이라 엄밀히 위반은 아님) | index.html:417-425, 1065-1080 |

---

## 통과 항목 (이상 없음)

### 색상 토큰
`:root` 핵심 토큰이 DESIGN.md와 정확히 일치:

| 토큰 | index.html | DESIGN.md | 결과 |
|------|-----------|-----------|------|
| `--bg` | `#F5F6FB` | `#F5F6FB` | OK |
| `--card` | `#FFFFFF` | `#FFFFFF` | OK |
| `--ink` | `#1F2437` | `#1F2437` | OK |
| `--sub` | `#7A809A` | `#7A809A` | OK |
| `--accent` | `#5B54E8` | `#5B54E8` | OK |
| `--danger` | `#EF6C6C` | `#EF6C6C` | OK |
| `--radius` | `18px` | `18px` | OK |

`manifest.webmanifest`의 `background_color:#F5F6FB`는 `--bg`와 정합. HTML `<meta name="theme-color" content="#F5F6FB">`도 DESIGN.md와 일치.

### 탭 네비게이션 (견출지 / bookmark ledger)
- radial-gradient `::before`/`::after` 곡선 커넥터 구현됨 (index.html:79-90)
- 활성 탭 `background:var(--card)` + `border-bottom:1px solid var(--card)` + `margin-bottom:-1px`로 아래 카드와 연결 (index.html:78)
- 활성 색상 `var(--accent)` / `font-weight:800`, 비활성 `var(--sub)` / `font-weight:700` — DESIGN.md와 일치 (index.html:64-78)
- 양 끝 탭 활성 시 상단 모서리 `var(--radius)` 처리, 첫/마지막 탭의 바깥쪽 커넥터 제거 (index.html:89-92)
- 탭 라벨은 텍스트 전용(계산기·환율·단위·나이·옥외광고), 이모지/아이콘 없음 — 규칙 준수 (index.html:364-368)

### Tabler Icons
- CDN: `@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css` — DESIGN.md 지정 버전(v3.19.0) 일치, 다른 아이콘 라이브러리 혼용 없음 (index.html:12)
- 마크업 전부 `<i class="ti ti-[name]"></i>` 형식:
  - `ti-backspace-filled` (index.html:384)
  - `ti-arrows-up-down` (index.html:433, 476)
  - `ti-arrow-narrow-right` (index.html:613)
  - `ti-plus` (index.html:619)
  - `ti-file-spreadsheet` (index.html:639)
- 모두 Tabler v3에 존재하는 유효 클래스, 오타·존재하지 않는 아이콘 없음. 인라인 SVG 대체 없음.

### 레이아웃
- `#app{max-width:430px}` — DESIGN.md 최대 폭 430px 준수 (index.html:34)
- 가로 패딩: `.screen`·`.tab-bar` 10px, 헤더 16px — DESIGN.md 10~16px 범위 내 (index.html:45, 58, 96)
- 카드 간격 `.tab-card + .tab-card{margin-top:12px}` — 10~12px 규격 내 (index.html:100)
- 헤더 아이콘 42px + 타이틀 20px/700/-0.3px letter-spacing — DESIGN.md 헤더 규격 일치 (index.html:50-52)

---

## 상세 지적 사항

### [중간] 1. manifest `theme_color` 불일치
- 위치: `manifest.webmanifest:8`
- 현재: `"theme_color": "#5B54E8"` (= `--accent`)
- 기대: DESIGN.md "PWA Requirements — Theme-color meta tag set to `#F5F6FB`". 실제 HTML `<meta name="theme-color">`는 `#F5F6FB`로 올바르게 설정돼 있으나(index.html:6), manifest의 `theme_color`만 accent 색으로 어긋나 있어 두 값이 서로 모순.
- 영향: Android/PWA 설치 시 상태바·태스크 전환 UI 색이 DESIGN 기준(`#F5F6FB`)과 달라짐.
- 제안: `manifest.webmanifest`의 `theme_color`를 `#F5F6FB`로 맞추거나, accent를 의도한 것이라면 DESIGN.md와 HTML meta 쪽을 함께 재검토.

### [중간] 2. safe-area-inset 부분 적용
- 위치: `index.html:45-46` (헤더 상단만), 하단 콘텐츠(`.calc-keypad-card`, `.oa-footnote` 등) 및 `.screen` 좌우에는 inset 없음
- 현재: `.app-header`가 `padding-top:max(env(safe-area-inset-top),14px)`로 상단 노치만 회피
- 기대: DESIGN.md "Safe-area-inset is mandatory for notched devices" + 구현 체크리스트 "safe-area padding". 하단 홈 인디케이터 영역(`env(safe-area-inset-bottom)`)과 가로 노치(`left`/`right`)에 대한 패딩이 필요.
- 제안: 최하단 카드/푸터 컨테이너에 `padding-bottom:max(env(safe-area-inset-bottom),10px)`, `.screen`에 좌우 inset 추가.

### [중간] 3. 입력 필드 치수 규격 이탈
DESIGN.md "Input Fields": 높이 40px, radius 10px, 2px accent 보더, 폰트 15px / 500~700.

| 요소 | 위치 | 이탈 항목 |
|------|------|-----------|
| `.rate-input` | index.html:161-166 | 폰트 18px (규격 15px) |
| `.unit-val` | index.html:204-209 | 폰트 18px (규격 15px) |
| `.rate-select` / `.unit-select` | index.html:155-160, 198-203 | 보더 `1.5px solid var(--line)` (규격 2px accent) |
| `.date-input` | index.html:216-221 | 높이 42px (규격 40px), 폰트 16px (규격 15px) |
| `.pa-cost-amt` | index.html:323-327 | radius 8px (규격 10px) |
| `.pa-cost-name` | index.html:318-322 | radius 8px, 보더 1.5px |

- 영향: 개별 편차는 작으나 화면마다 입력창 크기/폰트가 미세하게 달라 시스템 일관성 저하.
- 제안: 입력창 폰트 15px 통일, select 보더 2px 통일, radius 10px 통일. 의도적으로 값 입력창을 강조하려면 DESIGN.md에 예외 토큰을 추가하는 편이 정석.

### [낮음] 4. 하드코딩 색상 리터럴
- `index.html:25-28` — `::selection { background: rgba(91,84,232,.25) }` 등. `91,84,232`는 `--accent`(#5B54E8)의 RGB. 주석에도 "(--accent 5B54E8)"로 명시돼 있어 의도된 것이나, 토큰 변경 시 동기화 누락 위험. `--accent`를 `r,g,b` 형태 별도 토큰으로 두거나 `color-mix()` 사용 권장.
- `index.html:145` `.btn-eq{color:#fff}`, `:227` `.primary-btn{color:#fff}`, `:339` `.pa-download-btn{color:#fff}` — accent 위 흰 텍스트. `#fff`가 `--card`(#FFFFFF)와 사실상 동일하나 리터럴로 산재. 온-액센트 텍스트용 토큰(예: `--on-accent`) 도입 시 정리 가능.

### [낮음] 5. 규격 외 border-radius 산재
`--radius:18px`(카드), 입력 10px, 버튼 14px가 DESIGN 규격. 그 외 값들:
- `.header-icon` 13px (index.html:50)
- `.quick-card` 12px (index.html:180), `.age-result-card`/`.age-detail`/`.pa-summary-card` 12px (index.html:232, 241, 344)
- `.unit-tab` 9px, `.unit-tabs` 12px (index.html:189-193)
- `.pa-cost-name`/`.pa-cost-amt` 8px (index.html:320, 326), `.pa-add-btn`/`.pa-download-btn` 10px (index.html:331, 337)
- `.btn`(계산기 키패드) 14px (index.html:137) — 버튼 규격과는 일치
- 제안: 보조 카드/칩용 radius를 토큰화(예: `--radius-sm:12px`)해 임의값 제거.

### [낮음] 6. 환율 화면 국기 이모지
- 위치: `index.html:417-425`(fromCur/toCur `<option>`), `1065-1080`(renderQuick 퀵그리드)
- DESIGN.md의 "no emoji icons" 규칙은 "Tab Navigation" 절에 한정 서술돼 있어 탭바가 아닌 환율 통화 선택 UI는 엄밀히 규칙 위반은 아님.
- 다만 디자인 시스템 전반의 "텍스트/Tabler 아이콘" 지향과는 결이 다르므로, 통화 코드(KRW/USD…) 텍스트나 Tabler 아이콘으로 대체할지 검토 여지. 오케스트레이터 판단 필요.

---

## 결론
핵심 준수 항목(색상 토큰, 견출지 탭 스타일, Tabler Icons v3.19.0, 430px 레이아웃)은 모두 통과. 이전 지적으로 보이는 "탭바 이모지 아이콘"은 이미 제거되어 텍스트 전용 상태. 남은 것은 중간 3건(manifest theme_color, 하단 safe-area, 입력창 치수 드리프트)과 낮음 3건(색상 리터럴, radius 산재, 환율 국기 이모지)으로, 모두 시스템 일관성 정비 수준의 개선 항목이며 치명적 위반은 없음.
