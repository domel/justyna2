"use strict";

const CACHE_NAME = "testy-z-ustaw-v24";
const APP_FILES = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/csv.js",
  "./js/app.js",
  "./js/pwa.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./materialy-do-nauki/KPA-definicje.png",
  "./materialy-do-nauki/KPA-terminy.png",
  "./materialy-do-nauki/Kodeks postępowania.png",
  "./materialy-do-nauki/Kodeks-postępowania.png",
  "./materialy-do-nauki/Prawo budowlane.png",
  "./materialy-do-nauki/Ustawa o ochronie przyrody.png",
  "./materialy-do-nauki/Ustawa o ochronie zabytków.png",
  "./materialy-do-nauki/kpo-praktyka.png",
  "./materialy-do-nauki/Kompendium_zabytki_zielen_Podlaskie_normalne-1.pdf",
  "./materialy-do-nauki/Kompendium_zabytki_zielen_Podlaskie_ADHD-1.pdf",
  "./materialy-do-nauki/miniatury/kompendium-normalne.png",
  "./materialy-do-nauki/miniatury/kompendium-adhd.png",
  "./materialy-do-nauki/Ochrona zabytków Podlaskie.png",
  "./materialy-do-nauki/Prawo budowlane Podlaskie.png",
  "./materialy-do-nauki/KPA Podlaskie.png",
  "./materialy-do-nauki/Ochrona przyrody Podlaskie.png",
  "./materialy-do-nauki/Kazusy.pdf",
  "./materialy-do-nauki/miniatury/kazusy.png",
  "./materialy-do-nauki/Zabytki Definicje.png",
  "./materialy-do-nauki/Ewidencja i Rejestr Zabydkow.png",
  "./materialy-do-nauki/poradnik_wuoz_zielen-kolorowa.pdf",
  "./materialy-do-nauki/poradnik_wuoz_zielen_czarno-biała.pdf",
  "./materialy-do-nauki/Rozmowa_WUOZ_inspektor_ochrony_zabytkow.pdf",
  "./materialy-do-nauki/miniatury/poradnik-zielen-kolorowa.png",
  "./materialy-do-nauki/miniatury/poradnik-zielen-czarno-biala.png",
  "./materialy-do-nauki/miniatury/rozmowa-inspektor.png",
  "./data/pytania_Kodeks_postepowania_administracyjnego_KPA.csv",
  "./data/pytania_Prawo_budowlane.csv",
  "./data/pytania_Prawo_budowlane_skrocone_zabytki.csv",
  "./data/pytania_rozporzadzenie_DzU_2021_poz_56.csv",
  "./data/pytania_rozporzadzenie_DzU_2021_poz_81.csv",
  "./data/pytania_ustawa_o_ochronie_przyrody.csv",
  "./data/pytania_ustawa_o_ochronie_zabytkow_i_opiece_nad_zabytkami.csv"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate" && !url.pathname.toLowerCase().endsWith(".pdf")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const networkResponse = fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkResponse;
    })
  );
});
