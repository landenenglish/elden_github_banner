# Elden Banner

An Elden Ring–inspired browser extension that shows dramatic banners for GitHub events.  
When you merge a PR or approve a review, a cinematic banner appears with sound, just like in the Lands Between. ⚔️

> Forked from [Elden Email](https://github.com/mettignis/elden-email) and customized for GitHub workflows.

---

## Features

- **PR Merged** - Dramatic banner when you merge a pull request
- **Approved** - Banner when you approve a PR review
- Sound effect included (toggleable)
- Choose your banner color (gold, red, blue)
- Extensible trigger system for custom events

---

## Installation

### Chrome / Edge / Brave / Vivaldi

1. Download or clone this repository
2. Go to `chrome://extensions/`
3. Enable **Developer Mode** (top right toggle)
4. Click **Load unpacked** and select the project folder
5. Done! Navigate to a GitHub PR and try merging

### Firefox

1. Copy files from `src/` to a new folder
2. Rename `manifest_firefox.json` to `manifest.json`
3. Go to `about:debugging` → "This Firefox"
4. Click "Load Temporary Add-on" and select the `manifest.json`

---

## Adding Custom Triggers

The extension uses a config-driven trigger system. To add new events, edit the `TRIGGERS` array in `src/content.js`:

```javascript
{
  id: "my-custom-trigger",
  name: "Something Happened",
  urls: ["https://example.com/*"],
  detection: {
    type: "button_click",  // or "element_appears"
    selectors: [".my-button-class"],
    textMatch: ["Button Text"]  // optional
  },
  banner: {
    text: "SOMETHING ACHIEVED"
  }
}
```

### Detection Types

- **button_click** - Triggers when a matching button is clicked
- **element_appears** - Triggers when a matching element appears on the page

---

## Project Structure

```
├── manifest_chrome.json     # Manifest MV3 for Chrome/Edge/Brave
├── manifest_firefox.json    # Manifest MV2 for Firefox
├── src/
│   ├── content.js           # Core script with trigger engine
│   ├── triggers.js          # Trigger definitions (reference)
│   ├── style.css            # Banner styles with Mantinia font
│   ├── popup.html           # Settings popup
│   ├── popup.css            # Popup styles
│   ├── popup.js             # Popup logic
│   └── assets/
│       ├── elden_ring_sound.mp3
│       ├── icon.png
│       └── Mantinia.otf
```

---

## Credits

- Original [Elden Email](https://github.com/mettignis/elden-email) by mettignis
- Sound effects from FromSoftware games
- Mantinia font for the medieval aesthetic

This is a fan project inspired by FromSoftware's games. Not affiliated with or endorsed by FromSoftware, Bandai Namco, or any official entity.
