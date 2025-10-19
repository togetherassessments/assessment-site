// tts-init.ts - TTS player initialization module
// This module is lazy-loaded only when the accessibility panel opens,
// removing TTS JavaScript from the initial page load dependency tree

import type { TTSPlayer } from './tts-player';

let ttsPlayerInstance: TTSPlayer | null = null;
let ttsPlayerLoaded = false;

// TTS module loading state
type TTSModuleState = 'idle' | 'loading' | 'ready' | 'error';
let ttsModuleState: TTSModuleState = 'idle';
let ttsModuleLoadPromise: Promise<void> | null = null;

// Update TTS button UI based on loading state
function updateTTSButtonState(state: TTSModuleState) {
  const buttons = document.querySelectorAll('[data-tts-toggle]');

  buttons.forEach((button) => {
    const btn = button as HTMLButtonElement;
    const spinner = btn.querySelector('.tts-loading-spinner');
    const icon = btn.querySelector('.tts-btn-icon');

    switch (state) {
      case 'loading':
        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
        btn.setAttribute('aria-label', 'Loading text-to-speech...');
        if (spinner) (spinner as HTMLElement).style.display = 'inline-block';
        if (icon) (icon as HTMLElement).style.display = 'none';
        break;

      case 'ready':
        btn.disabled = false;
        btn.setAttribute('aria-busy', 'false');
        btn.setAttribute('aria-label', 'Listen to this page');
        if (spinner) (spinner as HTMLElement).style.display = 'none';
        if (icon) (icon as HTMLElement).style.display = 'inline-block';
        break;

      case 'error':
        btn.disabled = false;
        btn.setAttribute('aria-busy', 'false');
        btn.setAttribute('aria-label', 'Text-to-speech failed to load. Click to retry.');
        if (spinner) (spinner as HTMLElement).style.display = 'none';
        if (icon) (icon as HTMLElement).style.display = 'inline-block';
        break;

      case 'idle':
      default:
        btn.disabled = false;
        btn.setAttribute('aria-busy', 'false');
        btn.setAttribute('aria-label', 'Listen to this page');
        if (spinner) (spinner as HTMLElement).style.display = 'none';
        if (icon) (icon as HTMLElement).style.display = 'inline-block';
        break;
    }
  });
}

// Pre-load TTS module and voices
async function preloadTTSModule(): Promise<void> {
  // If already loading or ready, return existing promise or resolve immediately
  if (ttsModuleState === 'loading') {
    return ttsModuleLoadPromise || Promise.resolve();
  }
  if (ttsModuleState === 'ready') {
    return Promise.resolve();
  }

  // Start loading
  ttsModuleState = 'loading';
  updateTTSButtonState('loading');

  // Create and store the loading promise
  ttsModuleLoadPromise = (async () => {
    try {
      // Pre-load voices (early browser API call)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }

      // Load the TTS module
      const module = await import('~/scripts/tts-player');

      // Create instance and wait for voices
      ttsPlayerInstance = new module.TTSPlayer();
      ttsPlayerLoaded = true;

      // Wait a bit for voices to be ready (voices load async in some browsers)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Success
      ttsModuleState = 'ready';
      updateTTSButtonState('ready');
    } catch (error) {
      console.error('Failed to pre-load TTS module:', error);
      ttsModuleState = 'error';
      updateTTSButtonState('error');
      throw error;
    }
  })();

  return ttsModuleLoadPromise;
}

// On page load, ensure player UI is in correct initial state
function initializePlayerState() {
  const player = document.getElementById('tts-player');
  if (player) {
    // Reset to hidden state
    player.setAttribute('aria-hidden', 'true');
    // Reset collapsed state to false (so it will show correctly when opened)
    player.setAttribute('data-collapsed', 'false');

    // Reset play/pause button to initial state
    const playPauseBtn = player.querySelector('.tts-play-pause');
    if (playPauseBtn) {
      playPauseBtn.setAttribute('aria-label', 'Play');
      playPauseBtn.setAttribute('aria-pressed', 'false');
    }

    // Reset status text
    const statusEl = player.querySelector('#tts-status');
    if (statusEl) {
      statusEl.textContent = 'Listening to Page';
    }
  }
}

// Handle tab collapse/expand
function setupTabHandlers() {
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    // Ignore clicks from control buttons to prevent them from triggering player collapse
    // Control buttons (play/pause/stop) handle their own actions and shouldn't minimize the player
    if (target.closest('.tts-controls')) {
      return;
    }

    // Handle tab click (expand)
    const tab = target.closest('.tts-tab');
    if (tab) {
      const player = document.getElementById('tts-player');
      if (player) {
        player.setAttribute('data-collapsed', 'false');
      }
      return;
    }

    // Handle minimize button click (collapse)
    const minimize = target.closest('.tts-minimize');
    if (minimize) {
      const player = document.getElementById('tts-player');
      if (player) {
        player.setAttribute('data-collapsed', 'true');
      }
      return;
    }
  });
}

// Handle TTS toggle button clicks
function setupTTSToggleHandlers() {
  document.addEventListener('click', async (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('[data-tts-toggle]');
    if (!target) {
      return;
    }

    // If module is ready, use it synchronously (fixes mobile autoplay policy)
    if (ttsModuleState === 'ready' && ttsPlayerInstance) {
      const player = document.getElementById('tts-player');
      if (player?.getAttribute('aria-hidden') === 'false') {
        ttsPlayerInstance.close();
      } else {
        // This is synchronous - no await - fixes mobile!
        ttsPlayerInstance.start();
      }
      return;
    }

    // If loading, do nothing (button should be disabled)
    if (ttsModuleState === 'loading') {
      return;
    }

    // If error or idle, try to load now (fallback for edge cases)
    // This path still has the async boundary issue, but at least it works on desktop
    if (!ttsPlayerLoaded) {
      try {
        const module = await import('~/scripts/tts-player');
        ttsPlayerInstance = new module.TTSPlayer();
        ttsPlayerLoaded = true;
        ttsModuleState = 'ready';
        updateTTSButtonState('ready');
        ttsPlayerInstance.start();
      } catch {
        ttsModuleState = 'error';
        updateTTSButtonState('error');
        alert('Failed to load text-to-speech. Please try again.');
      }
    } else if (ttsPlayerInstance) {
      const player = document.getElementById('tts-player');
      if (player?.getAttribute('aria-hidden') === 'false') {
        ttsPlayerInstance.close();
      } else {
        ttsPlayerInstance.start();
      }
    }
  });
}

// Handle Astro view transitions
function setupNavigationHandlers() {
  // Handle page navigation
  document.addEventListener('astro:page-load', () => {
    // Reset player UI state after navigation
    initializePlayerState();

    // Reset TTS module state (keep instance loaded for performance)
    // Button returns to idle state, but module stays ready if already loaded
    if (ttsModuleState !== 'ready') {
      ttsModuleState = 'idle';
      ttsModuleLoadPromise = null;
      updateTTSButtonState('idle');
    }

    if (ttsPlayerLoaded && ttsPlayerInstance) {
      ttsPlayerInstance.updateContent();
    }
  });

  document.addEventListener('astro:before-preparation', () => {
    if (ttsPlayerInstance?.isPlaying()) {
      ttsPlayerInstance.pause();
    }
  });
}

/**
 * Initialize TTS system
 * Called once when accessibility panel opens for the first time
 */
export function initialize() {
  // Initialize player state
  initializePlayerState();

  // Set up all event handlers
  setupTabHandlers();
  setupTTSToggleHandlers();
  setupNavigationHandlers();

  // Immediately pre-load TTS module to ensure it's ready when user clicks "Listen"
  // This is critical for mobile autoplay policy compliance
  preloadTTSModule().catch(() => {
    // Error already handled in preloadTTSModule
  });
}
