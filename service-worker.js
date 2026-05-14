const CACHE_NAME = 'assistente-biblico-v5';
// URLs para armazenar em cache quando o service worker é instalado.
// Os caminhos são absolutos a partir da raiz.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.svg',
  '/manifest.json',
  'https://cdn.tailwindcss.com'
];

// Evento de instalação: armazena o shell do aplicativo em cache
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Ativa o novo service worker assim que terminar a instalação
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
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
    }).then(() => self.clients.claim()) // Assume o controle de todos os clientes abertos
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
                // Armazena apenas respostas básicas (da nossa origem) para evitar o armazenamento em cache de respostas opacas de outras origens
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