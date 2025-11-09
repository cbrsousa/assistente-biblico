const CACHE_NAME = 'biblical-chatbot-v5';
// URLs to cache when the service worker is installed.
// Paths are absolute from the root.
const URLS_TO_CACHE = [
  '/assistente-b-blico/',
  '/assistente-b-blico/index.html',
  '/assistente-b-blico/logo.svg',
  '/assistente-b-blico/manifest.json',
  'https://cdn.tailwindcss.com'
];

// Evento de instalação: armazena o shell do aplicativo em cache
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate new service worker as soon as it's finished installing
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento de ativação: limpa caches antigos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients
  );
});

// Evento de busca: serve do cache ou da rede
self.addEventListener('fetch', (event) => {
  // Queremos armazenar em cache apenas solicitações GET. Solicitações POST (como chamadas de API) devem sempre ir para a rede.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Para solicitações a CDNs de bibliotecas JS, usa uma estratégia stale-while-revalidate
  if (event.request.url.startsWith('https://aistudiocdn.com/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchedResponse = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchedResponse;
        });
      })
    );
    return;
  }

  // Para todas as outras solicitações GET, usa uma estratégia cache-first
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna a resposta
        if (response) {
          return response;
        }

        // Não está no cache - busca na rede, depois armazena em cache e retorna
        return fetch(event.request).then(
          (response) => {
            // Verifica se recebemos uma resposta válida
            if (!response || response.status !== 200) {
              return response;
            }

            // IMPORTANTE: Clona a resposta. Uma resposta é um stream
            // e como queremos que o navegador consuma a resposta
            // e também que o cache consuma a resposta, precisamos
            // cloná-la para ter dois streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Only cache basic responses (from our origin) to avoid caching opaque responses from other origins
                if (response.type === 'basic') {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});