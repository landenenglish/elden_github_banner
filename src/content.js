/**
 * Elden Banner - Content Script
 *
 * Shows Elden Ring-style banners for GitHub events.
 * Forked from Elden Email by MettiFire.
 *
 * @see https://github.com/MettiFire/elden_mail_banner
 */

// =============================================================================
// TRIGGER CONFIGURATION
// =============================================================================

const TRIGGERS = [
  {
    id: 'github-pr-merged',
    name: 'PR Merged',
    urls: ['https://github.com/*'],
    bannerStyle: 'enemy-felled',
    detection: {
      type: 'button_click',
      textMatch: [
        'Merge pull request',
        'Confirm merge',
        'Squash and merge',
        'Rebase and merge',
      ],
    },
    banner: {
      text: 'PR MERGED',
    },
  },
  {
    id: 'github-conflicts-detected',
    name: 'Conflicts Detected',
    urls: ['https://github.com/*'],
    bannerStyle: 'you-died',
    detection: {
      type: 'text_appears',
      textMatch: ['This branch has conflicts that must be resolved'],
    },
    banner: {
      text: 'CONFLICTS',
    },
  },
]

// =============================================================================
// BROWSER COMPATIBILITY
// =============================================================================

const storage =
  typeof browser !== 'undefined' ? browser.storage : chrome.storage

// =============================================================================
// ASSET LOADING
// =============================================================================

const soundUrl = chrome.runtime.getURL('assets/elden_ring_sound.mp3')

// Load Mantinia font dynamically (CSS relative paths don't work in content scripts)
const fontUrl = chrome.runtime.getURL('assets/Mantinia.otf')
const fontFace = new FontFace('Mantinia', `url(${fontUrl})`)
fontFace
  .load()
  .then((loadedFont) => document.fonts.add(loadedFont))
  .catch(() => {})

// =============================================================================
// USER PREFERENCES
// =============================================================================

let soundEnabled = true
let bannerColor = 'yellow'

async function loadPreferences() {
  if (!storage.sync) return

  try {
    const res = await new Promise((resolve) => {
      storage.sync.get(['soundEnabled', 'bannerColor'], resolve)
    })
    soundEnabled = res.soundEnabled !== undefined ? res.soundEnabled : true
    bannerColor = res.bannerColor || 'yellow'
  } catch {
    // Use defaults
  }
}

loadPreferences()

// Listen for preference changes
if (storage.onChanged) {
  storage.onChanged.addListener((changes) => {
    if (changes.soundEnabled) soundEnabled = changes.soundEnabled.newValue
    if (changes.bannerColor) bannerColor = changes.bannerColor.newValue
  })
}

// =============================================================================
// BANNER DISPLAY
// =============================================================================

/**
 * Show the Elden Ring-style banner
 * @param {string} text - Text to display
 * @param {string} style - Banner style: 'enemy-felled' | 'you-died' | 'grace'
 */
function showBanner(text, style = null) {
  // Remove existing banner
  document.getElementById('elden-ring-banner')?.remove()

  const banner = document.createElement('div')
  banner.id = 'elden-ring-banner'

  // Determine color class
  let colorClass = 'banner-'
  if (style === 'you-died') {
    colorClass += 'red'
  } else if (style === 'grace') {
    colorClass += 'blue'
  } else {
    colorClass += bannerColor
  }

  banner.className = colorClass
  banner.innerHTML = `
    <div class="elden-banner-overlay"></div>
    <div class="elden-banner-band"></div>
    <div class="elden-banner-content">
      <span class="elden-banner-text">${text}</span>
    </div>
  `

  document.body.appendChild(banner)

  // Play sound
  if (soundEnabled) {
    const audio = new Audio(soundUrl)
    audio.volume = 0.35
    audio.play().catch(() => {})
  }

  // Animate in/out
  setTimeout(() => banner.classList.add('show'), 50)
  setTimeout(() => {
    banner.classList.remove('show')
    setTimeout(() => banner.remove(), 500)
  }, 3000)
}

// =============================================================================
// TRIGGER DETECTION
// =============================================================================

/**
 * Check if current URL matches any patterns
 */
function matchesUrl(urlPatterns) {
  const currentUrl = window.location.href
  return urlPatterns.some((pattern) => {
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
    return new RegExp(`^${regexPattern}$`).test(currentUrl)
  })
}

/**
 * Check if text matches any patterns (case-insensitive)
 */
function matchesText(text, patterns) {
  if (!patterns?.length) return false
  const lower = text.toLowerCase().trim()
  return patterns.some((p) => lower.includes(p.toLowerCase()))
}

/**
 * Check if any pattern text exists on the page
 */
function findTextOnPage(patterns) {
  const bodyText = document.body.innerText || document.body.textContent || ''
  return matchesText(bodyText, patterns)
}

// =============================================================================
// TRIGGER HANDLERS
// =============================================================================

/**
 * Set up click listeners for button_click triggers
 */
function setupButtonClickTrigger(trigger) {
  const { detection, banner } = trigger

  if (!detection?.textMatch?.length) return

  document
    .querySelectorAll('button, [role="button"], a, div[onclick]')
    .forEach((element) => {
      // Skip if already attached
      if (element.getAttribute(`data-elden-trigger-${trigger.id}`)) return

      const elementText = (
        element.innerText ||
        element.textContent ||
        ''
      ).trim()
      const ariaLabel = element.getAttribute('aria-label') || ''
      const title = element.getAttribute('title') || ''

      const hasMatch = detection.textMatch.some((text) => {
        const lower = text.toLowerCase()
        return (
          elementText.toLowerCase().includes(lower) ||
          ariaLabel.toLowerCase().includes(lower) ||
          title.toLowerCase().includes(lower)
        )
      })

      if (hasMatch) {
        if (detection.additionalCheck && !detection.additionalCheck()) return

        element.addEventListener('click', () => {
          setTimeout(() => showBanner(banner.text, trigger.bannerStyle), 500)
        })
        element.setAttribute(`data-elden-trigger-${trigger.id}`, 'true')
      }
    })
}

/**
 * Check for text_appears triggers
 */
function checkTextAppearsTrigger(trigger) {
  const { detection, banner } = trigger

  if (!detection?.textMatch?.length) return
  if (trigger._triggered) return

  if (findTextOnPage(detection.textMatch)) {
    trigger._triggered = true
    showBanner(banner.text, trigger.bannerStyle)
  }
}

/**
 * Check for element_appears triggers
 */
function checkElementAppearsTrigger(trigger) {
  const { detection, banner } = trigger

  if (!detection?.selectors) return

  detection.selectors.forEach((selector) => {
    try {
      document.querySelectorAll(selector).forEach((element) => {
        if (element.getAttribute(`data-elden-triggered-${trigger.id}`)) return

        element.setAttribute(`data-elden-triggered-${trigger.id}`, 'true')
        showBanner(banner.text, trigger.bannerStyle)
      })
    } catch {
      // Invalid selector
    }
  })
}

// =============================================================================
// INITIALIZATION
// =============================================================================

function setupTriggerObservers() {
  const activeTriggers = TRIGGERS.filter((t) => matchesUrl(t.urls))

  if (!activeTriggers.length) return

  const processTriggers = () => {
    activeTriggers.forEach((trigger) => {
      if (!trigger?.detection) return

      switch (trigger.detection.type) {
        case 'button_click':
          setupButtonClickTrigger(trigger)
          break
        case 'text_appears':
          checkTextAppearsTrigger(trigger)
          break
        case 'element_appears':
          checkElementAppearsTrigger(trigger)
          break
      }
    })
  }

  // Watch for DOM changes
  const observer = new MutationObserver(processTriggers)
  observer.observe(document.body, { childList: true, subtree: true })

  // Process existing elements
  processTriggers()
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupTriggerObservers)
} else {
  setupTriggerObservers()
}
