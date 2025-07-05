(async () => {
  const browserAPI = typeof browser !== "undefined" ? browser : chrome;
  const hostname = window.location.hostname;
  let currentVolume;

  const stored = await browserAPI.storage.local.get("sites");
  // Sadece bu site için bir ayar varsa devam et
  if (stored.sites && stored.sites[hostname] !== undefined) {
    currentVolume = stored.sites[hostname];
  } else {
    return; // Ayar yoksa betiği bu noktada sonlandır
  }

  const applyVolume = (element) => {
    if (!(element instanceof HTMLMediaElement)) return;

    // Ses seviyesi zaten doğruysa gereksiz işlem yapma
    if (Math.abs(element.volume - currentVolume) < 0.01) {
      return;
    }

    element.volume = currentVolume;

    // "volumechange" olayını her elemana sadece bir kez eklemek için kontrol
    if (!element.dataset.volumeControlled) {
      element.dataset.volumeControlled = "true";
      element.addEventListener("volumechange", () => {
        // Sayfa veya başka bir eklenti sesi değiştirmeye çalışırsa, kendi ayarımıza geri döndür
        if (Math.abs(element.volume - currentVolume) > 0.01) {
          element.volume = currentVolume;
        }
      }, true);
    }
  };

  const initAllMedia = () => {
    document.querySelectorAll("video, audio").forEach(applyVolume);
  };

  // Sayfaya sonradan (dinamik olarak) eklenen video/audio elemanlarını yakalamak için
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) { // Eğer bir HTML elementi ise
          if (node.matches('video, audio')) {
            applyVolume(node);
          }
          // Eklenen elementin alt elemanlarını da kontrol et
          node.querySelectorAll('video, audio').forEach(applyVolume);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Sayfa ilk yüklendiğinde mevcut medya elemanlarını ayarla
  initAllMedia();

  // Popup'tan gelen anlık ses güncelleme mesajını dinle
  browserAPI.runtime.onMessage.addListener((message) => {
    if (message.type === "setVolume") {
      currentVolume = message.volume;
      initAllMedia(); // Tüm medya elemanlarının sesini yeni değere güncelle
    }
  });

})();