// LUMEN Tarot PWA Service Worker
// Strategy: App Shell (Cache-first) + API (Network-first)

const CACHE_NAME = 'lumen-tarot-v1';
const APP_SHELL_CACHE = 'lumen-shell-v1';
const IMAGE_CACHE = 'lumen-images-v1';

// App Shell — 핵심 리소스 (Cache-first)
const APP_SHELL_URLS = [
  '/',
  '/manifest.json',
];

// Install: App Shell 프리캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: 이전 캐시 정리
self.addEventListener('activate', (event) => {
  const currentCaches = [APP_SHELL_CACHE, IMAGE_CACHE, CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: 요청 유형별 전략 분기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청 → Network-first (오프라인 시 캐시 폴백)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // 타로 카드 이미지 → Cache-first (한번 받으면 변경 없음)
  if (url.pathname.startsWith('/images/tarot/')) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Next.js static assets (_next/) → Cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // 나머지 (페이지 네비게이션 등) → Network-first
  event.respondWith(networkFirst(request, APP_SHELL_CACHE));
});

// ========== 캐싱 전략 ==========

// Cache-first: 캐시에 있으면 즉시 반환, 없으면 네트워크 후 캐싱
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// Network-first: 네트워크 시도, 실패 시 캐시 폴백
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // 네비게이션 요청이면 오프라인 폴백 페이지 대신 캐시된 앱 셸 반환
    if (request.mode === 'navigate') {
      const shellCached = await caches.match('/');
      if (shellCached) return shellCached;
    }

    return new Response('Offline', { status: 503 });
  }
}
