// Trigger definitions for Elden Banner
// Each trigger defines when and how to show an Elden Ring-style banner

const TRIGGERS = [
  {
    id: 'github-pr-merged',
    name: 'PR Merged',
    urls: ['https://github.com/*'],
    detection: {
      type: 'button_click',
      selectors: [
        // Main merge button
        'button.btn-primary.merge-branch-action',
        // Merge commit button
        "button[data-details-container='.js-merge-commit-button']",
        // Generic merge buttons
        '.merge-message button.btn-primary',
        // Confirm merge buttons in dialogs
        '.js-merge-commit-button',
        '.js-squash-commit-button',
        '.js-rebase-commit-button',
      ],
      textMatch: [
        'Merge pull request',
        'Confirm merge',
        'Squash and merge',
        'Rebase and merge',
        'Merge',
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
      selectors: [
        "button[type='submit'].btn-primary",
        '.review-form button.btn-primary',
      ],
      textMatch: ['Approve', 'Submit review'],
      // Only trigger when the "Approve" radio is selected
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

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TRIGGERS
}
