# calc-note 디자인 시스템 준수 점검 리포트

- **점검 일시**: 2026-09-04
- **기준 문서**: https://raw.githubusercontent.com/gon2800/design/main/DESIGN.md (OohInsightLab Design System — Core Specifications, main 브랜치 최신본, 커밋 해시 미제공)
- **대상 파일**:
  - `/home/gon/calc-note/index.html` (단일 HTML, CSS/JS 인라인, 총 1655줄)
  - `/home/gon/calc-note/manifest.webmanifest`
- **점검 범위**: 색상 토큰 일치 / 견출지 탭 네비게이션 스타일 / Tabler Icons 사용 규칙 / DESIGN.md 레이아웃·치수 제약. (성능·PWA 유효성·모바일 터치 UX는 범위 외이며 이 리포트에 포함하지 않음)

---

## 1. 색상 토큰

### 1.1 `:root` 토큰 값 — 전부 일치 (이상 없음)

`index.html:15-21`

```css
:root{
  --bg:#F5F6FB; --card:#FFFFFF; --ink:#1F2437; --sub:#7A809A;
  --line:#EBEDF4; --line-strong:#D3D8E6; --accent:#5B54E8; --accent-dark:#4C46D6; --accent-soft:#EEEDFD;
  --danger:#EF6C6C; --danger-soft:#FDECEC;
  --shadow:0 1px 2px rgba(31,36,55,.04),0 8px 24px rgba(31,36,55,.06);
  --radius:18px;
}
```

DESIGN.md의 Color Tokens 블록과 11개 색상 토큰 + `--shadow` + `--radius` 값이 **HEX 단위까지 완전히 일치**한다. 폰트 스택(`index.html:30`)도 DESIGN.md Typography 항목과 동일.

### 1.2 [중간] manifest `theme_color`가 DESIGN.md Theme Meta 규격과 불일치

`manifest.webmanifest:7-8`

```json
"background_color": "#F5F6FB",
"theme_color": "#5B54E8",
```

- **기대값**: DESIGN.md "Theme Meta" 항목은 `<meta name="theme-color" content="#F5F6FB">` 로 명시 → 테마 색상은 `--bg`(#F5F6FB).
- **실제값**: manifest `theme_color`는 `--accent`(#5B54E8). 반면 `index.html:6`의 `<meta name="theme-color" content="#F5F6FB">`는 규격대로 `--bg`를 쓰고 있어 **HTML과 manifest가 서로 어긋난다.**
- **영향**: 설치형(PWA) 상태 표시줄/타이틀바 색이 문서 규격(연회색 배경)과 달리 인디고로 표시됨. 토큰 자체는 유효하나 "어느 토큰을 theme에 쓰는가"가 규격과 불일치.
- **수정 제안**: `manifest.webmanifest`의 `"theme_color"`를 `"#F5F6FB"`로 변경해 DESIGN.md 및 `index.html:6`과 일치시킨다. (인디고 상태바를 의도한 것이라면 DESIGN.md 쪽에 예외를 명문화할 것)

### 1.3 [낮음] 토큰 대신 색상 리터럴 하드코딩

- `index.html:25-28` — `::selection` / `::-moz-selection` 4개 규칙에서 `--accent`(#5B54E8 = rgb(91,84,232))를 `rgba(91,84,232,.25)` / `rgba(91,84,232,.30)`로 직접 기재.

  ```css
  ::selection{background:rgba(91,84,232,.25);color:var(--ink);}
  .rate-input::selection,...{background:rgba(91,84,232,.30);color:var(--ink);}
  ```

  - **기대값**: 토큰 파생 색은 `color-mix(in srgb, var(--accent) 25%, transparent)` 등 토큰 기반 표현.
  - **실제값**: 원시 rgb 리터럴. 주석으로 "(--accent 5B54E8)"라 인지는 하고 있으나 `--accent` 변경 시 동기화 누락 위험.
  - **수정 제안**: `--accent-selection: color-mix(...)` 형태의 파생 토큰을 `:root`에 추가하거나 `color-mix()`를 인라인 사용.

- `index.html:145` `.btn-eq{...color:#fff;}`, `index.html:227` `.primary-btn{...color:#fff;}`, `index.html:338` `.pa-download-btn{...color:#fff;}` — `#fff` 리터럴.
  - **기대값**: `--card`(#FFFFFF) 또는 최소한 `#FFFFFF` 표기 통일.
  - **수정 제안**: `color:var(--card);` 로 치환(값 동일, 의미 명확화). 심각도 낮음.

### 1.4 [낮음] `--radius` 토큰 활용도 및 반경 리터럴 산재

- `--radius`(18px)는 `.tab-card`(`index.html:99`)와 `.tab-item:first/last-child.active`(`index.html:91-92`)에서만 사용.
- 그 외 반경은 전부 리터럴: `13px`(`:50` 헤더 아이콘 — DESIGN Header Layout 규격과 일치하므로 정상), `14px`(`:137,224,338`), `12px`(`:180,232,240,304,344` 등 내부 서브카드 다수), `10px`(입력/셀렉트 — DESIGN Input/Secondary 규격 10px와 일치, 정상), `9px`(`:193,331`), `8px`(`:74,320,326`).
  - **기대값**: DESIGN.md는 카드 반경 `--radius:18px`, 바텀시트 24px, 버튼 14/10px, 입력 10px만 규정. 내부 서브카드용 12px는 규격에 없음.
  - **실제값**: 12px 서브카드 반경이 관례적으로 반복 사용되나 토큰화되지 않음.
  - **수정 제안**: `--radius-sm:12px` 같은 보조 토큰을 도입해 서브카드(`.quick-card`, `.age-result-card`, `.age-detail`, `.pa-table-scroll`, `.pa-summary-card`)에 일괄 적용. 심각도 낮음(색상 아님, 일관성 개선 목적).

### 1.5 manifest `background_color` — 일치 (이상 없음)

`manifest.webmanifest:7` `"background_color": "#F5F6FB"` = `--bg`. 정상.

---

## 2. 탭 네비게이션 (견출지 / Bookmark Ledger 스타일)

### 2.1 곡선 커넥터 `::before` / `::after` — 규격과 정확히 일치 (이상 없음)

`index.html:79-90`

```css
.tab-item.active::before,
.tab-item.active::after{ content:""; position:absolute; bottom:0; width:8px;height:8px; pointer-events:none; }
.tab-item.active::before{left:-8px;background:radial-gradient(circle at top left, transparent 8px, var(--card) 8px);}
.tab-item.active::after{right:-8px;background:radial-gradient(circle at top right, transparent 8px, var(--card) 8px);}
.tab-item:first-child.active::before{content:none;}
.tab-item:last-child.active::after{content:none;}
```

DESIGN.md "Tab Navigation (견출지 Bookmark Style)" 코드 블록의 `radial-gradient(circle at top left, transparent 8px, var(--card) 8px)` 와 문자열 단위로 동일. 양 끝 탭의 바깥쪽 커넥터를 `content:none`으로 제거한 처리도 올바름.

### 2.2 활성 탭 색/배경/굵기 — 일치 (이상 없음)

`index.html:78` `.tab-item.active{background:var(--card);color:var(--accent);font-weight:800;border-bottom:1px solid var(--card);margin-bottom:-1px;}`

DESIGN.md "Active tab color: var(--accent), weight 800, background: var(--card)" 와 일치. `margin-bottom:-1px` + `border-bottom:1px solid var(--card)`로 아래 카드와 이음새를 덮는 처리도 견출지 규격에 부합.

### 2.3 첫/마지막 탭 코너 처리 — 일치 (이상 없음)

- `index.html:91-92` — 첫 탭 활성 시 `border-top-left-radius:var(--radius)`, 마지막 탭 활성 시 `border-top-right-radius:var(--radius)`.
- `index.html:101-102` — `.tab-card.corner-first{border-radius:0 var(--radius) var(--radius) var(--radius);}` (좌상단 직각), `.corner-last{border-radius:var(--radius) 0 var(--radius) var(--radius);}` (우상단 직각).
- `index.html:671-674` JS가 활성 스크린의 첫 카드에 `corner-first`(idx===0) / `corner-last`(마지막 idx) 클래스를 토글.

DESIGN.md "First tab active applies `.corner-first` (left-top sharp); last tab applies `.corner-last` (right-top sharp)" 와 일치.

### 2.4 텍스트 전용 / 이모지·아이콘 금지 규칙 — 준수 (이상 없음)

`index.html:363-369`

```html
<div class="tab-bar">
  <div class="tab-item active" onclick="switchTab('calc')">계산기</div>
  <div class="tab-item" onclick="switchTab('fx')">환율</div>
  <div class="tab-item" onclick="switchTab('unit')">단위</div>
  <div class="tab-item" onclick="switchTab('age')">나이</div>
  <div class="tab-item" onclick="switchTab('oa')">옥외광고</div>
</div>
```

5개 탭 모두 순수 텍스트 라벨. 이모지·`<i class="ti">`·SVG 없음 → DESIGN.md의 "주의: 탭에 이모지 아이콘 사용하지 않음. 텍스트만." 규칙 준수.

### 2.5 슬라이드 전환 — 일치 (이상 없음)

`index.html:686` `oldScreen.style.transition = newScreen.style.transition = 'transform .25s ease';` → DESIGN.md "Transition: 0.25s ease on translateX slide" 와 일치.

### 2.6 [낮음] 탭 글자 크기가 타이포 규격과 다름

`index.html:64-77`

```css
.tab-item{ ... font-size:13px; font-weight:700; color:var(--sub); ... }
```

- **기대값**: DESIGN.md Typography — "Tab text: 14px weight 700 (inactive) / 800 (active)".
- **실제값**: `font-size:13px`. 굵기(비활성 700 / 활성 800)는 일치하나 크기가 1px 작음.
- **수정 제안**: `.tab-item`의 `font-size`를 `14px`로 조정. 5개 탭이 `max-width:430px`에서 `flex:1`로 균등 분할되며 `옥외광고`(4자)가 가장 길어 14px에서도 `min-width:54px` 내 배치 가능. 심각도 낮음.

---

## 3. Tabler Icons 사용 규칙

### 3.1 CDN / 버전 — 일치 (이상 없음)

`index.html:12`

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css">
```

DESIGN.md "Library: Tabler Icons Webfont v3.19.0 / CDN: https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css" 와 URL·버전 완전 일치. 다른 아이콘 라이브러리 병용 없음.

### 3.2 마크업 형태 — 일치 (이상 없음)

모든 아이콘이 `<i class="ti ti-[name]"></i>` 형태이며 존재하는 아이콘 클래스:

| 위치 | 코드 | 아이콘 유효성 |
|------|------|---------------|
| `index.html:384` | `<i class="ti ti-backspace-filled"></i>` | 유효 (백스페이스 filled 변형) |
| `index.html:433` | `<i class="ti ti-arrows-up-down"></i>` | 유효 (환율 스왑) |
| `index.html:476` | `<i class="ti ti-arrows-up-down"></i>` | 유효 (단위 스왑) |
| `index.html:613` | `<i class="ti ti-arrow-narrow-right pa-arrow"></i>` | 유효 (수수료율→수수료 화살표) |
| `index.html:619` | `<i class="ti ti-plus"></i>` | 유효 (항목 추가) |
| `index.html:639` | `<i class="ti ti-file-spreadsheet"></i>` | 유효 (엑셀 내려받기) |

오타/미존재 클래스 없음. 인라인 SVG로 대체된 곳 없음.

### 3.3 [낮음] 아이콘 자리에 유니코드 기호 문자 사용

- `index.html:528` `<button class="more-btn" id="moreBtn" onclick="toggleMore()">더 보기 ▾</button>`
- `index.html:636` `<button class="more-btn" id="paMoreBtn" onclick="paToggleDetail()">펼쳐보기 ▾</button>`
- JS `index.html:1274`, `index.html:1402` — 토글 시 `▾` / `▴` 문자열 직접 치환.

  - **기대값**: DESIGN.md는 아이콘을 `<i class="ti ti-[name]"></i>`로 삽입하도록 규정. 펼침/접힘 지시자는 `ti-chevron-down` / `ti-chevron-up`이 존재.
  - **실제값**: `▾`(U+25BE) / `▴`(U+25B4) 기하 도형 문자를 텍스트로 사용. Tabler 폰트 미적용, 자형이 플랫폼별로 상이.
  - **수정 제안**: 텍스트와 아이콘을 분리해 `<span>더 보기</span><i class="ti ti-chevron-down"></i>` 로 바꾸고 토글 시 아이콘 클래스만 `ti-chevron-up`으로 교체. 심각도 낮음.

### 3.4 [낮음 / 참고] 환율 화면의 이모지 국기

- `index.html:417-425`, `index.html:441-449` — 통화 선택 `<option>`에 `🇰🇷 🇺🇸 🇨🇳 🇻🇳 🇯🇵 🇪🇺 🇨🇦 🇦🇺 🇵🇪` 이모지 국기.
- `index.html:1065-1066`, `index.html:1074` — 주요 통화 quick-grid 렌더에도 동일 이모지 국기.

  - DESIGN.md의 이모지 금지 규칙은 **탭 네비게이션에 한정**되어 있고(2.4 참조), 본문 콘텐츠의 이모지·Tabler 국기 아이콘 부재에 대한 규정은 없음. Tabler Icons v3.19.0에는 국기 아이콘 세트가 없어 대체도 불가.
  - 따라서 **규칙 위반 아님**. 다만 디자인 시스템이 이모지 사용 전반을 지양한다면 SVG 국기 스프라이트 또는 통화 코드 텍스트만 사용하는 방안을 DESIGN.md 차원에서 검토 권장. 심각도 낮음(참고).

---

## 4. 레이아웃 · 치수 규격

### 4.1 최대 폭 / 수평 패딩 / 카드 간격 — 일치 (이상 없음)

- `index.html:34` `#app{ ... max-width:430px; ... }` → DESIGN.md "Maximum width: 430px (centered)". `body`가 `justify-content:center`(`index.html:30`)로 중앙 정렬.
- 수평 패딩: 헤더 `0 16px`(`index.html:45`), 탭바 `0 10px`(`index.html:58`), 스크린 `0 10px 10px`(`index.html:96`) → DESIGN.md "Horizontal padding: 10–16px" 범위 내.
- 카드 세로 간격: `index.html:100` `.tab-card + .tab-card{margin-top:12px;}` → DESIGN.md "Card vertical gap: 10–12px margin-bottom" 범위 내(방향만 margin-top으로 구현, 시각적 결과 동일). 서브 영역 `margin-top:10px`(`:231,240` 등)도 범위 내.

### 4.2 [중간] safe-area-inset이 헤더 상단에만 적용됨

- 적용된 곳: `index.html:45-46`

  ```css
  .app-header{ padding:env(safe-area-inset-top,14px) 16px 10px;
               padding-top:max(env(safe-area-inset-top),14px); ... }
  ```

- 누락된 곳:
  - `index.html:96` `.screen{ ... padding:0 10px 10px; ... }` — 스크롤 영역 **하단 패딩에 `env(safe-area-inset-bottom)` 없음.** 계산기 키패드(`.calc-grid`, `index.html:135`)·수익성 분석 버튼이 화면 최하단에 위치하므로 하단 인셋 영역과 겹칠 수 있음.
  - 좌/우: 어느 셀렉터에도 `env(safe-area-inset-left/right)` 없음. `#app`이 뷰포트 폭 430px 미만 기기에서 `width:100%`로 가장자리까지 차므로 가로 방향 노치/라운드 코너 대응 부재.

  - **기대값**: DESIGN.md "Layout Constraints — Safe-area-inset required on **all** padding".
  - **실제값**: 상단만 대응.
  - **수정 제안**:
    - `.screen` 하단: `padding:0 10px calc(10px + env(safe-area-inset-bottom));`
    - `#app` 또는 `.app-header`/`.tab-bar`/`.screen` 수평 패딩에 `max(10px, env(safe-area-inset-left))` / `...-right` 반영.
  - 심각도 중간(명시된 레이아웃 제약 미준수, 단 색상/구조 아님).

### 4.3 Primary 버튼 — 규격과 정확히 일치 (이상 없음)

`index.html:224-229`

```css
.primary-btn{ width:100%; height:46px; border-radius:14px;
  background:var(--accent); color:#fff; border:none;
  font-size:16px; font-weight:700; cursor:pointer; margin-top:12px; }
.primary-btn:active{background:var(--accent-dark);}
```

DESIGN.md Button Specifications의 Primary 행(100% / 46px / 14px / var(--accent))과 일치. `:active` 시 `--accent-dark` 사용도 "Accent pressed state" 토큰 의도에 부합. (`color:#fff`는 1.3 참조 — 낮음)

### 4.4 Select — 규격과 일치 (이상 없음)

`index.html:155-160`(`.rate-select`), `index.html:198-203`(`.unit-select`): `border:1.5px solid var(--line); background:var(--bg);` → DESIGN.md "Select: 1.5px solid var(--line) border, background var(--bg)" 와 일치.

### 4.5 [낮음] 입력 필드 치수/토큰이 Input Fields 규격과 부분 불일치

DESIGN.md Input Fields 규격: `Height 40px / Border-radius 10px / Border 2px solid var(--accent) / Padding 0 10px / Font-size 15px / Background var(--card)`.

| 셀렉터 | 코드 | 규격 대비 차이 |
|--------|------|----------------|
| `.rate-input` `index.html:161-166` | h40 / r10 / 2px accent / pad 0 10 / **font 18** / bg card | font-size 18px (규격 15px) |
| `.unit-val` `index.html:204-209` | h40 / r10 / 2px accent / pad 0 10 / **font 18** / bg card | font-size 18px (규격 15px) |
| `.date-input` `index.html:216-221` | **h42** / r10 / 2px accent / **pad 0 8** / **font 16** / bg card | 높이 42px, 패딩 0 8px, font 16px |
| `.oa-input` `index.html:269-274` | (h 미지정) / r10 / 2px accent / **pad 5px 8px** / font 15 / **bg accent-soft** | 배경 `--accent-soft`(규격 `--card`), 패딩 상이, 높이 미지정 |
| `.pa-cost-amt` `index.html:323-327` | **r8** / 2px accent / pad 6px 8px / **font 14** / **bg accent-soft** | 반경 8px, 배경 `--accent-soft`, font 14px |

- **기대값**: 위 표의 규격 열.
- **실제값**: 표시 강조 목적의 큰 글자(18px)·강조 배경(`--accent-soft`)·조밀한 옥외광고 표 레이아웃(패딩 축소, r8) 등으로 편차.
- **수정 제안**: 최소한 배경은 규격대로 `var(--card)`로 통일(강조가 필요하면 `--accent` 2px 보더로 충분). 폰트 크기는 입력 강조 의도가 명확하면 DESIGN.md에 "강조 입력(변환기)" 변형을 추가 정의. 심각도 낮음.

### 4.6 [낮음] Secondary 버튼 성격의 요소가 규격 치수와 다름

- `.pa-add-btn`(`index.html:329-334`): `height:38px; border-radius:10px; background:var(--accent-soft);`
- `.pa-download-btn`(`index.html:335-341`): `height:38px; border-radius:10px; background:var(--accent);`

  - **기대값**: DESIGN.md Button Specifications — Secondary는 `height 40px / radius 10px / var(--card) + 2px border`. Primary는 46px/14px.
  - **실제값**: 높이 38px(규격 40/46 어느 쪽도 아님), 배경도 `--accent-soft` / `--accent`로 Secondary 규격(카드+보더)과 다름.
  - **수정 제안**: 전폭 보조 액션이면 height 40px + radius 10px로 맞추고, 필요 시 "톤다운 Primary(accent-soft 배경)" 변형을 DESIGN.md에 명문화. 심각도 낮음.

### 4.7 참고 — 규격에 대응 요소가 없는 항목 (위반 아님)

- Header "Settings button 40×40 / radius 9px": `index.html:355-360` 헤더에 설정 버튼 자체가 없음 → 미구현일 뿐 불일치 아님.
- "Icon Delete 34×34 / radius 9px / danger-soft", "FAB 44×44 circle", "Bottom Sheet Modal", "Android Back Handling": calc-note에 해당 컴포넌트 부재. `.rate-swap`(36×36 투명)은 DESIGN에 규격이 없는 자체 스왑 아이콘 버튼으로, 대조 대상 없음.

---

## 종합

| 심각도 | 건수 | 항목 |
|--------|------|------|
| 높음 | 0 | — |
| 중간 | 2 | manifest `theme_color` 규격 불일치(1.2) / safe-area-inset 하단·좌우 누락(4.2) |
| 낮음 | 6 | 색상 리터럴 하드코딩(1.3) / `--radius` 토큰화 부족(1.4) / 탭 글자 13px(2.6) / 기호문자 대신 Tabler 미사용(3.3) / 입력 필드 치수·배경 편차(4.5) / 보조 버튼 치수 편차(4.6) |

핵심 축(11개 색상 토큰 HEX, 견출지 탭 곡선 커넥터·활성색·코너·전환, Tabler Webfont v3.19.0 CDN·마크업, 최대 폭 430px·카드 간격·Primary/Select 규격)은 **전부 규격을 정확히 준수**한다. 발견된 사항은 테마 메타 토큰 선택 불일치와 safe-area 부분 적용(중간), 그리고 토큰화·치수 미세 편차(낮음)에 국한된다.
