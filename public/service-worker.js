
const CACHE_NAME = "serenia-cache-v1";


const ASSETS_TO_CACHE = [
  "/",
  "/html/Login.html",
  "/css/main.css",
  "/js/login.js",
  "/icons/192x192.png",
  "/icons/512x512.png"
];


self.addEventListener("install", (event) => {
  console.log("Service Worker: Instalado");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );

  self.skipWaiting();
});


self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activado");


  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {

  const isOnline = navigator.onLine;


  if (!isOnline) {
    return event.respondWith(
      new Response(
        `
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Sin conexión</title>
          </head>
          <body style="
            margin:0;
            height:100vh;
            display:flex;
            flex-direction:column;
            justify-content:center;
            align-items:center;
            text-align:center;
            font-family:Arial, sans-serif;
            background:#f7f7f7;
            color:#333;">
            
            <img src="/icons/192x192.png" width="80" style="opacity:0.8; margin-bottom:20px;" />
            <h2>No tienes conexión a Internet</h2>
            <p style="max-width:250px;">
              Algunas funciones pueden no estar disponibles hasta que te conectes a la red.
            </p>
          </body>
        </html>
        `,
        { headers: { "Content-Type": "text/html" } }
      )
    );
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {

      if (cachedResponse) return cachedResponse;


      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {

            if (event.request.method === "GET") {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
        .catch(() => cachedResponse); 
    })
  );
});
