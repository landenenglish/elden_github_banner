# ⚔️ Elden Banner

An Elden Ring–inspired browser extension that shows dramatic banners for GitHub events.

When you merge a PR, a cinematic **"PR MERGED"** banner appears with sound — just like defeating a boss in the Lands Between.

> 🗡️ Forked from [Elden Email](https://github.com/MettiFire/elden_mail_banner) by [MettiFire](https://github.com/MettiFire)

---

## ✨ Features

- **PR Merged** — Gold "ENEMY FELLED" style banner when you merge
- **Conflicts Detected** — Red "YOU DIED" style banner for merge conflicts
- 🎵 Sound effect (toggleable)
- 🎨 Choose banner color (gold, red, blue)
- 🔧 Extensible trigger system for custom events

---

## 📦 Installation

### Chrome / Edge / Brave

1. Download or clone this repository
2. Go to `chrome://extensions/`
3. Enable **Developer Mode** (top right)
4. Click **Load unpacked** → select this folder
5. Done! Merge a PR to test

### Firefox

1. Go to `about:debugging` → "This Firefox"
2. Click **Load Temporary Add-on**
3. Select `manifest_firefox.json`

---

## 🎯 How It Works

The extension watches for specific events on GitHub:

| Event     | Detection              | Banner Style        |
| --------- | ---------------------- | ------------------- |
| PR Merged | Click on merge buttons | Gold (Enemy Felled) |
| Conflicts | Text appears on page   | Red (You Died)      |

---

## 🔧 Adding Custom Triggers

Edit the `TRIGGERS` array in `src/content.js`:

```javascript
{
  id: 'my-trigger',
  name: 'My Event',
  urls: ['https://example.com/*'],
  bannerStyle: 'enemy-felled', // or 'you-died', 'grace'
  detection: {
    type: 'button_click', // or 'text_appears', 'element_appears'
    textMatch: ['Button Text', 'Alt Text'],
  },
  banner: {
    text: 'ACHIEVEMENT',
  },
}
```

### Detection Types

| Type              | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `button_click`    | Triggers when clicking a button matching `textMatch`    |
| `text_appears`    | Triggers when text matching `textMatch` appears on page |
| `element_appears` | Triggers when elements matching `selectors` appear      |

---

## 📁 Project Structure

```
├── manifest_chrome.json    # Chrome/Edge/Brave manifest (MV3)
├── manifest_firefox.json   # Firefox manifest (MV2)
├── src/
│   ├── content.js          # Core logic & trigger definitions
│   ├── style.css           # Banner styles
│   ├── popup.html/css/js   # Settings popup
│   └── assets/
│       ├── elden_ring_sound.mp3
│       ├── icon.png
│       └── Mantinia.otf
```

---

## 📜 Credits & Attribution

- **Original Project**: [Elden Email](https://github.com/MettiFire/elden_mail_banner) by [Anna Mettifogo (MettiFire)](https://github.com/MettiFire)
- **Sound Effects**: Sourced from FromSoftware games
- **Font**: Mantinia for the medieval aesthetic

This is a fan project inspired by FromSoftware's games. Not affiliated with or endorsed by FromSoftware, Bandai Namco, or any official entity.

---

## 📄 License

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) — Free to share and adapt for non-commercial use with attribution.
