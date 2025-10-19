// accessibility-panel-init.ts - Accessibility panel interaction module
// This module is lazy-loaded only when the accessibility panel opens for the first time,
// removing event handler JavaScript from the initial page load dependency tree

/**
 * Initialize accessibility panel interactions
 * Called once when accessibility panel opens for the first time
 */
export function initialize() {
  // Get references to utility functions from the inline script
  // These are exposed globally by the critical inline script
  const {
    getSettings,
    saveSettings,
    resetSettings,
    applySettings,
    applyFont,
    applyTheme,
    applyTextSize,
    applyLineHeight,
  } = window.accessibilityPanelUtils;

  // Get state from global scope
  let currentSettings = getSettings();

  // Reading ruler state
  let readingRulerElement: HTMLElement | null = null;
  let rulerHandleElement: HTMLElement | null = null;
  let readingRulerEnabled = false;

  // Drag state
  let isDraggingRuler = false;
  let dragStartY = 0;
  let rulerStartTop = 0;

  // === EVENT DELEGATION FOR ALL INTERACTIVE ELEMENTS ===
  // Note: Panel toggle is handled in the inline script for immediate response
  // This module handles all other interactions after lazy-loading
  // Use event delegation on document level to persist across Astro view transitions

  // Font selection - delegated
  document.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.matches && target.matches('input[name="font"]')) {
      currentSettings.font = target.value;
      saveSettings(currentSettings);
      applyFont(currentSettings.font);
    }
  });

  // Theme selection - delegated
  document.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.matches && target.matches('input[name="theme"]')) {
      currentSettings.theme = target.value;
      saveSettings(currentSettings);
      applyTheme(currentSettings.theme);
    }
  });

  // Text size buttons - delegated
  document.addEventListener('click', (e: MouseEvent) => {
    const button = (e.target as HTMLElement).closest('.accessibility-size-btn') as HTMLButtonElement;
    if (!button) return;

    const size = button.dataset.textSize;
    if (!size) return;

    currentSettings.textSize = size;
    saveSettings(currentSettings);

    // Update active state
    document.querySelectorAll('.accessibility-size-btn').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');

    // Update label
    const labels: Record<string, string> = {
      xs: 'Extra Small',
      sm: 'Small',
      base: 'Normal',
      lg: 'Large',
      xl: 'Extra Large',
    };
    const label = document.getElementById('text-size-label');
    if (label) label.textContent = labels[size] || 'Normal';

    // Apply the text size
    applyTextSize(size);

    // Update ruler height if ruler is enabled
    if (readingRulerEnabled) {
      updateRulerHeight();
    }
  });

  // Line height - delegated
  document.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.matches && target.matches('input[name="lineHeight"]')) {
      currentSettings.lineHeight = target.value;
      saveSettings(currentSettings);
      applyLineHeight(currentSettings.lineHeight);

      // Update ruler height if ruler is enabled
      if (readingRulerEnabled) {
        updateRulerHeight();
      }
    }
  });

  // Reading ruler - delegated
  document.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.id === 'reading-ruler') {
      currentSettings.readingRuler = target.checked;
      saveSettings(currentSettings);
      // Call directly from window object to get the updated implementation
      window.accessibilityPanelUtils.applyReadingRuler(currentSettings.readingRuler);
    }
  });

  // Reset button - delegated
  document.addEventListener('click', (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('#reset-settings');
    if (!target) return;

    currentSettings = resetSettings();
    applySettings(currentSettings);

    // Update UI to reflect reset
    location.reload(); // Simple way to reset all UI elements
  });

  // Close button - delegated
  document.addEventListener('click', (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('#accessibility-close');
    if (!target) return;
    closePanel();
  });

  // Close on backdrop click - delegated
  document.addEventListener('click', (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('#accessibility-backdrop');
    if (!target) return;
    closePanel();
  });

  // Close on Escape key - using event delegation
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      const panel = document.getElementById('accessibility-panel');
      if (panel?.classList.contains('open')) {
        closePanel();
      }
    }
  });

  // Keyboard shortcut: Ctrl+Shift+A (or Cmd+Shift+A on Mac) - using event delegation
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      const panel = document.getElementById('accessibility-panel');
      const allToggleButtons = document.querySelectorAll('[data-accessibility-toggle]');

      if (panel?.classList.contains('open')) {
        closePanel();
      } else {
        panel?.classList.add('open');
        allToggleButtons.forEach((btn) => btn.setAttribute('aria-expanded', 'true'));
        document.body.classList.add('accessibility-panel-open');
        setupFocusTrap();
      }
    }
  });

  // Focus trap implementation
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let firstFocusableElement: HTMLElement | null = null;
  let lastFocusableElement: HTMLElement | null = null;

  function setupFocusTrap() {
    const panel = document.getElementById('accessibility-panel');
    if (!panel) return;

    const focusableContent = panel.querySelectorAll(focusableElements);
    firstFocusableElement = focusableContent[0] as HTMLElement;
    lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement;

    // Focus first element when panel opens
    if (firstFocusableElement) firstFocusableElement.focus();
  }

  // Set up focus trap immediately when module loads (panel should already be open)
  setupFocusTrap();

  // Trap focus within panel - using event delegation
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    const panel = document.getElementById('accessibility-panel');
    if (!panel || !panel.classList.contains('open')) return;

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift+Tab: going backwards
        if (document.activeElement === firstFocusableElement) {
          e.preventDefault();
          if (lastFocusableElement) lastFocusableElement.focus();
        }
      } else {
        // Tab: going forwards
        if (document.activeElement === lastFocusableElement) {
          e.preventDefault();
          if (firstFocusableElement) firstFocusableElement.focus();
        }
      }
    }
  });

  function closePanel() {
    const panelElement = document.getElementById('accessibility-panel');
    const allToggleButtons = document.querySelectorAll('[data-accessibility-toggle]');

    if (panelElement) panelElement.classList.remove('open');
    allToggleButtons.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
    document.body.classList.remove('accessibility-panel-open');
  }

  /**
   * Get current text size scale factor
   */
  function getTextSizeScale() {
    const body = document.body;
    if (body.classList.contains('text-size-xs')) return 0.875;
    if (body.classList.contains('text-size-sm')) return 0.9375;
    if (body.classList.contains('text-size-lg')) return 1.125;
    if (body.classList.contains('text-size-xl')) return 1.25;
    return 1; // base
  }

  /**
   * Update ruler height based on line height and text size settings
   */
  function updateRulerHeight() {
    if (!readingRulerElement) return;

    // Get current line height scale from body class
    const body = document.body;
    let lineHeightScale = 1.5; // Default (normal)

    if (body.classList.contains('line-height-compact')) {
      lineHeightScale = 1.2;
    } else if (body.classList.contains('line-height-relaxed')) {
      lineHeightScale = 2.0;
    }

    // Get current text size scale
    const textSizeScale = getTextSizeScale();

    // Calculate final height: base font size (16px) × text size scale × line height scale × 1.2 (20% larger)
    const heightInEm = textSizeScale * lineHeightScale * 1.2;

    // Set the height
    readingRulerElement.style.height = `${heightInEm}em`;
  }

  /**
   * Position ruler at specific Y coordinate (viewport-relative)
   */
  function positionRuler(topPosition: number) {
    if (!readingRulerElement) return;

    // Get ruler height in pixels
    const rulerHeight = readingRulerElement.offsetHeight;

    // Constrain to viewport
    const minY = 0;
    const maxY = window.innerHeight - rulerHeight;
    const constrainedTop = Math.max(minY, Math.min(maxY, topPosition));

    // Update position
    readingRulerElement.style.top = `${constrainedTop}px`;
  }

  /**
   * Setup drag handlers for ruler handle
   */
  function setupDragHandlers() {
    if (!rulerHandleElement) return;

    // Mouse drag start
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRuler = true;
      dragStartY = e.clientY;
      rulerStartTop = readingRulerElement!.offsetTop;
      rulerHandleElement!.classList.add('dragging');
      e.preventDefault(); // Prevent text selection
    };

    // Touch drag start
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      isDraggingRuler = true;
      dragStartY = e.touches[0].clientY;
      rulerStartTop = readingRulerElement!.offsetTop;
      rulerHandleElement!.classList.add('dragging');
      e.preventDefault(); // Prevent text selection and scrolling
    };

    // Mouse drag move
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRuler) return;
      const deltaY = e.clientY - dragStartY;
      const newTop = rulerStartTop + deltaY;
      positionRuler(newTop);
    };

    // Touch drag move
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRuler || e.touches.length !== 1) return;
      const deltaY = e.touches[0].clientY - dragStartY;
      const newTop = rulerStartTop + deltaY;
      positionRuler(newTop);
      e.preventDefault(); // Prevent scrolling while dragging
    };

    // Mouse drag end
    const handleMouseUp = () => {
      if (!isDraggingRuler) return;
      isDraggingRuler = false;
      rulerHandleElement?.classList.remove('dragging');
    };

    // Touch drag end
    const handleTouchEnd = () => {
      if (!isDraggingRuler) return;
      isDraggingRuler = false;
      rulerHandleElement?.classList.remove('dragging');
    };

    // Keyboard support for accessibility
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!rulerHandleElement) return;

      const step = 10; // pixels to move per keypress
      let newTop = readingRulerElement!.offsetTop;

      if (e.key === 'ArrowUp') {
        newTop -= step;
        positionRuler(newTop);
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        newTop += step;
        positionRuler(newTop);
        e.preventDefault();
      }
    };

    // Attach event listeners
    rulerHandleElement.addEventListener('mousedown', handleMouseDown);
    rulerHandleElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    rulerHandleElement.addEventListener('keydown', handleKeyDown);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);

    // Store handler references for cleanup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (rulerHandleElement as any)._handlers = {
      mousedown: handleMouseDown,
      touchstart: handleTouchStart,
      keydown: handleKeyDown,
      mousemove: handleMouseMove,
      touchmove: handleTouchMove,
      mouseup: handleMouseUp,
      touchend: handleTouchEnd,
    };
  }

  /**
   * Remove drag handlers
   */
  function removeDragHandlers() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!rulerHandleElement || !(rulerHandleElement as any)._handlers) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlers = (rulerHandleElement as any)._handlers;

    rulerHandleElement.removeEventListener('mousedown', handlers.mousedown);
    rulerHandleElement.removeEventListener('touchstart', handlers.touchstart);
    rulerHandleElement.removeEventListener('keydown', handlers.keydown);

    document.removeEventListener('mousemove', handlers.mousemove);
    document.removeEventListener('touchmove', handlers.touchmove);
    document.removeEventListener('mouseup', handlers.mouseup);
    document.removeEventListener('touchend', handlers.touchend);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (rulerHandleElement as any)._handlers;
  }

  /**
   * Create reading ruler with draggable handle
   */
  function createReadingRuler() {
    if (readingRulerElement) return; // Already exists

    // Create container
    const container = document.createElement('div');
    container.className = 'reading-ruler-container';

    // Create draggable handle
    const handle = document.createElement('div');
    handle.className = 'reading-ruler-handle';
    handle.setAttribute('aria-label', 'Drag to reposition reading ruler');
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-orientation', 'vertical');
    handle.setAttribute('tabindex', '0');

    // Add Tabler icon (arrows-move-vertical)
    handle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 7l0 14"></path>
        <path d="M9 18l3 3l3 -3"></path>
        <path d="M9 6l3 -3l3 3"></path>
      </svg>
    `;

    // Create highlight bar
    const highlight = document.createElement('div');
    highlight.className = 'reading-ruler-highlight';

    // Assemble
    container.appendChild(handle);
    container.appendChild(highlight);
    document.body.appendChild(container);

    // Store references
    readingRulerElement = container;
    rulerHandleElement = handle;

    // Set initial height based on current line height and text size settings
    updateRulerHeight();

    // Position in middle of viewport initially
    const initialTop = (window.innerHeight - parseFloat(container.style.height || `${container.offsetHeight}`)) / 2;
    positionRuler(initialTop);

    // Setup drag handlers
    setupDragHandlers();
  }

  /**
   * Remove reading ruler element
   */
  function removeReadingRuler() {
    if (readingRulerElement) {
      readingRulerElement.remove();
      readingRulerElement = null;
      rulerHandleElement = null;
    }
  }

  /**
   * Enable reading ruler
   */
  function enableReadingRuler() {
    if (readingRulerEnabled) return; // Already enabled
    createReadingRuler();
    document.body.classList.add('reading-ruler-active');

    // Add padding to mobile nav menu items directly via inline styles
    // This ensures the padding is applied even when Tailwind utilities have higher specificity
    const mobileNavs = document.querySelectorAll('#header nav');
    mobileNavs.forEach((nav) => {
      (nav as HTMLElement).style.paddingLeft = '40px';
    });

    readingRulerEnabled = true;
  }

  /**
   * Disable reading ruler
   */
  function disableReadingRuler() {
    if (!readingRulerEnabled) return; // Already disabled

    // Remove drag handlers
    removeDragHandlers();

    // Remove ruler element
    removeReadingRuler();

    // Remove body padding
    document.body.classList.remove('reading-ruler-active');

    // Remove inline padding from mobile nav menu items
    const mobileNavs = document.querySelectorAll('#header nav');
    mobileNavs.forEach((nav) => {
      (nav as HTMLElement).style.paddingLeft = '';
    });

    // Reset drag state
    isDraggingRuler = false;
    dragStartY = 0;
    rulerStartTop = 0;

    readingRulerEnabled = false;
  }

  /**
   * Apply reading ruler setting
   */
  function applyReadingRulerLocal(enabled: boolean) {
    if (enabled) {
      enableReadingRuler();
    } else {
      disableReadingRuler();
    }
  }

  // Export reading ruler functions to global scope for use by inline script
  if (window.accessibilityPanelUtils) {
    window.accessibilityPanelUtils.applyReadingRuler = applyReadingRulerLocal;
    window.accessibilityPanelUtils.removeDragHandlers = removeDragHandlers;
    window.accessibilityPanelUtils.removeReadingRuler = removeReadingRuler;
    window.accessibilityPanelUtils.updateReadingRulerState = (enabled: boolean) => {
      readingRulerEnabled = enabled;
    };
  }

  // === ASTRO VIEW TRANSITIONS ===
  // Cleanup reading ruler during page transitions
  document.addEventListener('astro:before-swap', () => {
    // Clean up ruler element and event listeners during page transition
    if (readingRulerEnabled) {
      // Remove drag handlers
      removeDragHandlers();
      // Remove ruler element
      removeReadingRuler();
      // Reset drag state
      isDraggingRuler = false;
      dragStartY = 0;
      rulerStartTop = 0;
      // Reset flag so it can be recreated on next page if setting is enabled
      readingRulerEnabled = false;
    }
  });
}
