console.log('Elden Banner content.js loaded!')

// Trigger definitions - inline to avoid module loading issues in content scripts
const TRIGGERS = [
  {
    id: 'github-pr-merged',
    name: 'PR Merged',
    urls: ['https://github.com/*'],
    detection: {
      type: 'button_click',
      // Use generic button selector - we'll rely on text matching
      selectors: ['button'],
      textMatch: [
        'Merge pull request',
        'Confirm merge',
        'Squash and merge',
        'Rebase and merge',
        'Confirm squash and merge',
        'Confirm rebase and merge',
      ],
    },
    banner: {
      text: 'PR MERGED',
    },
  },
  {
    id: 'github-pr-approved',
    name: 'PR Approved',
    urls: ['https://github.com/*'],
    detection: {
      type: 'button_click',
      selectors: ['button'],
      textMatch: ['Submit review'],
      additionalCheck: () => {
        const approveRadio = document.querySelector(
          'input[value="approve"]:checked'
        )
        return approveRadio !== null
      },
    },
    banner: {
      text: 'APPROVED',
    },
  },
]

// Polyfill for Firefox compatibility
const storage =
  typeof browser !== 'undefined' ? browser.storage : chrome.storage

// Pre-load sound file
const soundUrl = chrome.runtime.getURL('assets/elden_ring_sound.mp3')

// Default settings
let soundEnabled = true
let bannerColor = 'yellow'

// Load preferences
const loadPrefs = async () => {
  if (storage.sync) {
    try {
      const res = await new Promise((resolve) => {
        storage.sync.get(['soundEnabled', 'bannerColor'], resolve)
      })
      soundEnabled = res.soundEnabled !== undefined ? res.soundEnabled : true
      bannerColor = res.bannerColor || 'yellow'
    } catch (e) {
      console.error('Error loading preferences:', e)
    }
  }
}
loadPrefs()

// Real-time preference updates
if (storage.onChanged) {
  storage.onChanged.addListener((changes) => {
    if (changes.soundEnabled) soundEnabled = changes.soundEnabled.newValue
    if (changes.bannerColor) bannerColor = changes.bannerColor.newValue
  })
}

/**
 * Show the Elden Ring-style banner with dynamic text
 * @param {string} text - The text to display on the banner
 */
function showBanner(text) {
  // Remove any existing banner
  const existingBanner = document.getElementById('elden-ring-banner')
  if (existingBanner) {
    existingBanner.remove()
  }

  const banner = document.createElement('div')
  banner.id = 'elden-ring-banner'
  banner.className = `banner-${bannerColor}`

  banner.innerHTML = `
    <div class="elden-banner-overlay"></div>
    <div class="elden-banner-content">
      <span class="elden-banner-text">${text}</span>
    </div>
  `

  document.body.appendChild(banner)

  if (soundEnabled) {
    const audio = new Audio(soundUrl)
    audio.volume = 0.35
    audio.play().catch((err) => console.error('Error playing sound:', err))
  }

  // Animate in
  setTimeout(() => banner.classList.add('show'), 50)

  // Animate out after 3 seconds
  setTimeout(() => {
    banner.classList.remove('show')
    setTimeout(() => banner.remove(), 500)
  }, 3000)
}

/**
 * Check if the current URL matches any of the trigger's URL patterns
 * @param {string[]} urlPatterns - Array of URL patterns (with wildcards)
 * @returns {boolean}
 */
function matchesUrl(urlPatterns) {
  const currentUrl = window.location.href
  return urlPatterns.some((pattern) => {
    // Convert wildcard pattern to regex
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(currentUrl)
  })
}

/**
 * Check if an element matches the trigger's detection criteria
 * @param {Element} element - The DOM element to check
 * @param {Object} detection - The trigger's detection configuration
 * @param {string} triggerId - For debug logging
 * @returns {boolean}
 */
function matchesDetection(element, detection, triggerId = '') {
  // Check if element matches any selector
  const matchesSelector = detection.selectors.some((selector) => {
    try {
      return element.matches(selector)
    } catch (e) {
      return false
    }
  })

  if (!matchesSelector) return false

  // Check text match if specified
  if (detection.textMatch && detection.textMatch.length > 0) {
    const elementText = (element.innerText || element.textContent || '').trim()
    const ariaLabel = element.getAttribute('aria-label') || ''
    const title = element.getAttribute('title') || ''

    const matchesText = detection.textMatch.some((text) => {
      const lowerText = text.toLowerCase()
      return (
        elementText.toLowerCase().includes(lowerText) ||
        ariaLabel.toLowerCase().includes(lowerText) ||
        title.toLowerCase().includes(lowerText)
      )
    })

    if (matchesText) {
      console.log(`Elden Banner: Found matching button for ${triggerId}:`, elementText)
    }

    if (!matchesText) return false
  }

  // Run additional check if specified
  if (
    detection.additionalCheck &&
    typeof detection.additionalCheck === 'function'
  ) {
    if (!detection.additionalCheck()) return false
  }

  return true
}

/**
 * Set up observers for all matching triggers
 */
function setupTriggerObservers() {
  // Filter triggers that match the current URL
  const activeTriggers = TRIGGERS.filter((trigger) => matchesUrl(trigger.urls))

  if (activeTriggers.length === 0) {
    console.log('Elden Banner: No active triggers for this URL')
    return
  }

  console.log(
    `Elden Banner: ${activeTriggers.length} active trigger(s) for this URL`
  )

  // Set up a single MutationObserver for all triggers
  const observer = new MutationObserver(() => {
    activeTriggers.forEach((trigger) => {
      if (trigger.detection.type === 'button_click') {
        setupButtonClickTrigger(trigger)
      } else if (trigger.detection.type === 'element_appears') {
        checkElementAppearsTrigger(trigger)
      }
    })
  })

  observer.observe(document.body, { childList: true, subtree: true })

  // Also run immediately for any existing elements
  activeTriggers.forEach((trigger) => {
    if (trigger.detection.type === 'button_click') {
      setupButtonClickTrigger(trigger)
    } else if (trigger.detection.type === 'element_appears') {
      checkElementAppearsTrigger(trigger)
    }
  })
}

/**
 * Set up click listeners for button_click type triggers
 * @param {Object} trigger - The trigger configuration
 */
function setupButtonClickTrigger(trigger) {
  const { detection, banner } = trigger

  // Find all potential buttons
  detection.selectors.forEach((selector) => {
    try {
      document.querySelectorAll(selector).forEach((element) => {
        // Skip if already attached
        if (element.dataset[`eldenTrigger_${trigger.id}`]) return

        // Check if element matches detection criteria
        if (matchesDetection(element, detection, trigger.id)) {
          element.addEventListener('click', () => {
            // Re-check additional criteria at click time
            if (detection.additionalCheck && !detection.additionalCheck()) {
              return
            }
            console.log(`Elden Banner: Triggered "${trigger.name}"`)
            setTimeout(() => showBanner(banner.text), 500)
          })
          element.dataset[`eldenTrigger_${trigger.id}`] = 'true'
          console.log(`Elden Banner: Attached listener to button for ${trigger.id}`)
        }
      })
    } catch (e) {
      // Selector might be invalid, skip it
    }
  })
}

/**
 * Check for element_appears type triggers
 * @param {Object} trigger - The trigger configuration
 */
function checkElementAppearsTrigger(trigger) {
  const { detection, banner } = trigger

  detection.selectors.forEach((selector) => {
    try {
      const elements = document.querySelectorAll(selector)
      elements.forEach((element) => {
        // Skip if already triggered for this element
        if (element.dataset[`eldenTriggered_${trigger.id}`]) return

        console.log(
          `Elden Banner: Triggered "${trigger.name}" (element appeared)`
        )
        element.dataset[`eldenTriggered_${trigger.id}`] = 'true'
        showBanner(banner.text)
      })
    } catch (e) {
      // Selector might be invalid, skip it
    }
  })
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupTriggerObservers)
} else {
  setupTriggerObservers()
}
