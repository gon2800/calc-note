// 배포 때마다 이 버전을 올리면 이전 캐시가 자동 정리되고 새 자산이 재설치됩니다.
// v47: cache-first → network-first 전환 (배포 후 수동 캐시 삭제 없이 즉시 반영)
// v49: install precache 방어 처리. '/index.html'은 Cloudflare Pages가 '/'로 308
//      리다이렉트하는데, redirected 응답을 cache.addAll()에 넘기면 TypeError로 install
//      전체가 실패한다(→ 새 SW가 영영 활성화되지 않음). '/'만 precache하고, 각 URL을
//      개별 fetch → 상태 확인 후 put하여 하나가 실패해도 install이 죽지 않도록 한다.
// v50: 모바일 UX 수정 — 옥외광고 상세표 좌우 스크롤과 탭 스와이프 충돌 해소
//      (touch-action pan-x pan-y + 스와이프 핸들러가 .pa-table-scroll 무시),
//      당겨서 새로고침 시 입력값 유실 방지(overscroll-behavior:contain).
// v51: perf — Tabler 웹폰트(1MB+ cross-origin) 제거하고 아이콘 5종 SVG 인라인화,
//      앱 아이콘 재압축(icon-192 432KB→11KB, icon-512 505KB→84KB) 및
//      any/maskable 분리(icon-*-maskable.png 추가).
// v52: design-check/perf/mobile-ux 잔여 항목 — theme_color 통일(#F5F6FB),
//      탭/입력창 폰트 규격화, ▾/▴ 기호를 SVG 셰브런으로 교체, ::selection·서브카드
//      radius 토큰화, .oa-input 배경 --card, 스와이프 임계 10→35px,
//      수익성 상세표 디바운스(접힘 시 재생성 스킵).
const CACHE_NAME = 'calc-note-v52';

// network-first: 배포마다 바뀔 수 있는 앱 셸 / 코드
// '/index.html'은 넣지 않는다 — Cloudflare Pages가 '/'로 308 리다이렉트하므로
// precache 시 redirected 응답이 되어 실패하고, 런타임에도 '/'로 이미 커버된다.
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
];

// cache-first: 자주 바뀌지 않는 정적 이미지
const STATIC_ASSETS = [
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512-maskable.png',
];

// cache.addAll()은 URL 하나라도 실패하면(예: 308 리다이렉트, 404) 전체가 reject되어
// install이 통째로 무너진다. 각 URL을 개별 처리해 하나가 실패해도 나머지는 캐시한다.
async function precache(cache, urls) {
  await Promise.all(
    urls.map(async (url) => {
      try {
        // { cache: 'reload' }: HTTP 캐시를 건너뛰고 항상 새 자산을 받아온다.
        const response = await fetch(url, { cache: 'reload' });
        if (!response || !response.ok) {
          console.warn('[sw] precache 건너뜀(status ' + (response && response.status) + '):', url);
          return;
        }
        // redirected 응답을 그대로 put하면 TypeError가 나므로 정제해서 저장.
        const safe = response.redirected ? await cleanRedirect(response) : response;
        await cache.put(url, safe);
      } catch (err) {
        console.warn('[sw] precache 실패:', url, err);
      }
    })
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => precache(cache, [...APP_SHELL, ...STATIC_ASSETS]))
  );
  // 새 버전이 대기 상태에 머물지 않고 곧바로 활성화되도록.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

// '/index.html' 등은 Cloudflare Pages가 308로 '/'에 리다이렉트한다.
// redirected 응답을 respondWith()에 그대로 넘기면 브라우저가 네트워크 에러로 처리하므로 정제한다.
async function cleanRedirect(response) {
  const body = await response.blob();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

function isImageRequest(request, url) {
  return request.destination === 'image' || /\.(png|jpe?g|gif|svg|webp|ico)$/i.test(url.pathname);
}

// cache-first: 캐시에 있으면 즉시 반환, 없으면 네트워크에서 받아 캐시에 저장.
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// network-first: 네트워크를 먼저 시도해 캐시를 갱신하고, 실패 시에만 캐시로 폴백.
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const safe = response.redirected ? await cleanRedirect(response) : response;
      cache.put(request, safe.clone());
      return safe;
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // 네트워크·캐시 모두 실패한 내비게이션은 앱 셸로 폴백.
    if (request.mode === 'navigate') {
      const shell = await cache.match('/');
      if (shell) return shell;
    }
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // GET만 처리. 환율 API 등 외부(cross-origin) 요청은 건드리지 않고 흘려보냄.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isImageRequest(request, url)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});
