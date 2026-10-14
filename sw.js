// 오프라인에서도 열리도록 앱 파일을 저장해 둡니다. 앱을 고치면 VERSION 숫자를 올리세요.
const VERSION = 'flag-explorer-v17';
const FILES = ['./', 'index.html', 'manifest.webmanifest',
  'assets/geo.js', 'assets/char.js', 'assets/treasure-a.js', 'assets/treasure-b.js', 'assets/village.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {   // 앱 화면: 인터넷이 되면 새 버전, 안 되면 저장본
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put('index.html', c)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {   // 글꼴·아이콘: 저장본 먼저
    if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); }
    return r;
  })));
});
