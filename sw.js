// 배포 때마다 이 버전을 올리면 이전 캐시가 자동 정리되고 새 자산이 재설치됩니다.
// v47: cache-first → network-first 전환 (배포 후 수동 캐시 삭제 없이 즉시 반영)
const CACHE_NAME = 'calc-note-v47';

// network-first: 배포마다 바뀔 수 있는 앱 셸 / 코드
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
];

// cache-first: 자주 바뀌지 않는 정적 이미지
const STATIC_ASSETS = [
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([...APP_SHELL, ...STATIC_ASSETS]))
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
