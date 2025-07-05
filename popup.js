const browserAPI = typeof browser !== "undefined" ? browser : chrome;

const siteList = document.getElementById("site-list");
const addCurrentBtn = document.getElementById("add-current");
const addCustomBtn = document.getElementById("add-custom");

document.addEventListener("DOMContentLoaded", loadSites);

addCurrentBtn.addEventListener("click", async () => {
  const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });
  const hostname = new URL(tab.url).hostname;
  await saveSiteVolume(hostname, 1.0);
  loadSites();
});

addCustomBtn.addEventListener("click", () => {
  const modal = document.getElementById("url-modal");
  const input = document.getElementById("url-input");
  const ok = document.getElementById("url-ok");
  const cancel = document.getElementById("url-cancel");

  modal.style.display = "flex";
  input.value = "";
  input.focus();

  const closeModal = () => {
    modal.style.display = "none";
    ok.onclick = null;
    cancel.onclick = null;
    document.removeEventListener("keydown", escClose);
    modal.removeEventListener("click", outsideClick);
  };

  const escClose = (e) => {
    if (e.key === "Escape") closeModal();
  };

  const outsideClick = (e) => {
    if (e.target === modal) closeModal();
  };

  cancel.onclick = closeModal;

  ok.onclick = async () => {
    const hostname = input.value.trim();
    if (hostname) {
      await saveSiteVolume(hostname, 1.0);
      loadSites(); // site eklendikten sonra hemen görünür
    }
    closeModal();
	
  };
  
  input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const hostname = input.value.trim();
    if (hostname) {
      await saveSiteVolume(hostname, 1.0);
      loadSites();
    }
    closeModal();
  }
});

  document.addEventListener("keydown", escClose);
  modal.addEventListener("click", outsideClick);
});



async function saveSiteVolume(hostname, volume) {
  const stored = await browserAPI.storage.local.get("sites");
  const sites = stored.sites || {};
  sites[hostname] = volume;
  await browserAPI.storage.local.set({ sites });
}

async function removeSite(hostname) {
  const stored = await browserAPI.storage.local.get("sites");
  const sites = stored.sites || {};
  delete sites[hostname];
  await browserAPI.storage.local.set({ sites });
  loadSites();
}

async function loadSites() {
  siteList.innerHTML = "";
  const stored = await browserAPI.storage.local.get("sites");
  const sites = stored.sites || {};
  const [activeTab] = await browserAPI.tabs.query({ active: true, currentWindow: true });

  for (const [hostname, volume] of Object.entries(sites)) {
    const block = document.createElement("div");
    block.className = "site-block";

    const row = document.createElement("div");
    row.className = "site-entry";

	const icon = document.createElement("img");
	icon.src = `https://${hostname}/favicon.ico`;
	icon.onerror = () => icon.src = "icons/icon48.png";


    const label = document.createElement("span");
    label.textContent = hostname;

    row.appendChild(icon);
    row.appendChild(label);

    const sliderWrap = document.createElement("div");
    sliderWrap.className = "slider-container";
    sliderWrap.style.maxHeight = "0";
    sliderWrap.style.opacity = "0";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = 0;
    slider.max = 100;
    slider.value = Math.round(volume * 100);

    const percent = document.createElement("span");
    percent.textContent = `${slider.value}%`;

    slider.addEventListener("input", async () => {
      const newVolume = slider.value / 100;
      percent.textContent = `${slider.value}%`;
      await saveSiteVolume(hostname, newVolume);

      const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });
      const currentHost = new URL(tab.url).hostname;

      if (currentHost === hostname) {
        browserAPI.tabs.sendMessage(tab.id, { type: "setVolume", volume: newVolume });
      }
    });

    sliderWrap.appendChild(slider);
    sliderWrap.appendChild(percent);

    const clickArea = document.createElement("div");
    clickArea.style.position = "absolute";
    clickArea.style.top = "0";
    clickArea.style.left = "0";
    clickArea.style.right = "0";
    clickArea.style.bottom = "0";
    clickArea.style.cursor = "pointer";
    clickArea.title = "Tıklayınca sesi ayarla, sağ tıkla sil";

    clickArea.addEventListener("click", () => {
      const isOpen = sliderWrap.style.maxHeight !== "0px";
      sliderWrap.style.maxHeight = isOpen ? "0" : "60px";
      sliderWrap.style.opacity = isOpen ? "0" : "1";
    });

    clickArea.addEventListener("contextmenu", (e) => {
     e.preventDefault();

     // Var olan menü varsa kaldır
     const oldMenu = document.querySelector(".context-menu");
     if (oldMenu) oldMenu.remove();

     // Yeni menü öğesi
     const menu = document.createElement("div");
     menu.className = "context-menu";
     menu.textContent = "Kaldır";
     menu.style.top = `${e.clientY}px`;
      menu.style.left = `${e.clientX}px`;

      // Tıklanınca siteyi sil
     menu.addEventListener("click", () => {
      removeSite(hostname);
      menu.remove();
    });

  // Sayfaya ekle
  document.body.appendChild(menu);

  // Otomatik kapanma
  setTimeout(() => {
    menu.remove();
  }, 2000);
});


    row.style.position = "relative";
    row.appendChild(clickArea);
    block.appendChild(row);
    block.appendChild(sliderWrap);
    siteList.appendChild(block);
  }
}
