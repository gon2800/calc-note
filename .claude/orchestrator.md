# calc-note 전체 점검 오케스트레이터

사용자가 **"calc-note 전체 점검해줘"** (또는 유사 지시)라고 하면 이 절차를 따른다.

## 1. 병렬 실행
아래 4개 서브에이전트를 **동시에(병렬로)** 실행한다. 각 에이전트는 자기 관점만 보고,
겹치는 지적은 하지 않는다.

| 에이전트 | 관점 | 리포트 파일 |
|---|---|---|
| `design-check` | DESIGN.md 색상 토큰 · 탭 견출지 스타일 · Tabler Icons 규칙 | `.claude/reports/<날짜>-design-check.md` |
| `mobile-ux`    | 갤럭시+삼성인터넷 터치 타겟 · 포커스 · 제스처 충돌 · 키보드 겹침 | `.claude/reports/<날짜>-mobile-ux.md` |
| `perf`         | 파일 용량 · 인라인 스크립트 속도 · 리렌더링 · 이미지/폰트 로딩 | `.claude/reports/<날짜>-perf.md` |
| `pwa-check`    | manifest 유효성 · SW network-first · 오프라인 · maskable 아이콘 | `.claude/reports/<날짜>-pwa-check.md` |

각 에이전트에 전달할 지시:
> calc-note(`/home/gon/calc-note`)를 네 정의 파일(`.claude/agents/<이름>.md`)의 기준으로 점검하라.
> `<날짜>`는 오늘 날짜(YYYY-MM-DD). 상세 리포트를 지정 경로에 저장하고,
> 심각도(높음/중간/낮음) 순 최대 5줄 요약만 반환하라.

## 2. 취합
4개 에이전트의 5줄 요약을 모아 **하나의 최종 요약**으로 정리한다.

- 모든 발견을 심각도로 재정렬: **높음 → 중간 → 낮음** (관점 구분 없이 전체 통합 우선순위).
- 각 줄 형식: `[높음][perf] 요약 문장 — 리포트: 2026-09-04-perf.md`
- 같은 근본 원인을 여러 관점이 지적하면 한 줄로 합치고 `(design-check, perf)`처럼 관점을 병기.
- 끝에 관점별 리포트 파일 경로 목록과, "높음 N건 / 중간 N건 / 낮음 N건" 집계를 붙인다.

## 3. 반환 형식
```
## calc-note 전체 점검 결과 (<날짜>)

### 우선순위 요약
[높음][pwa-check] ...
[높음][mobile-ux] ...
[중간][design-check] ...
...

### 집계
높음 N · 중간 N · 낮음 N

### 상세 리포트
- .claude/reports/<날짜>-design-check.md
- .claude/reports/<날짜>-mobile-ux.md
- .claude/reports/<날짜>-perf.md
- .claude/reports/<날짜>-pwa-check.md
```

## 규칙
- 오케스트레이터는 코드를 직접 수정하지 않는다. 점검·보고까지만.
- 어떤 에이전트가 "이상 없음"이면 그 사실도 요약에 남긴다.
- 리포트 파일은 항상 최신 실행으로 덮어쓴다(같은 날 재실행 시).
