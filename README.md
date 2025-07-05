# Zen URL Volume Control

This add-on is developed for the Zen Browser and allows users to control the sound level of video and audio content on a per-site basis.

## 🚀 Features

- Save individual volume settings for each site (host-based)
- Automatically re-applies volume settings on page reloads
- Real-time volume control from the extension popup
- Works with most audio/video content using standard `<audio>` and `<video>` elements

## 🔧 How It Works

1. When a site with media loads, the extension reads saved volume settings.
2. It automatically applies the saved level to all media elements on the page.
3. You can change the volume using the slider in the extension popup.
4. The extension immediately updates the current page without requiring a reload.

**📝 Note:** After adding a site to the volume list, you need to refresh the page **once** for the volume control to activate. After that, real-time volume control will work without refreshing.


## 🧪 Limitations

- Does not affect iframe content from other origins (security policy)
- Cannot control Web Audio API-based sounds
- Sites must have media elements in the DOM to be affected

## 📦 Installation

You can install this extension directly from the Zen Browser Add-on Store:

[🔗 Zen Site Volume Manager – Official Add-on Page](https://addons.mozilla.org/tr/firefox/addon/zen-site-volume-manager/)

---

Manual Installation (for developers):

    Clone or download this repository.

    Open the about:addons page in Zen Browser.

    Click “Load Temporary Add-on” and select the manifest.json file from this repo.


## 🧠 Author

Created by Vseprr (https://github.com/vesprr)

---

Feel free to contribute or suggest improvements!
