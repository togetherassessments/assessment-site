# Accessibility

This document details the accessibility features implemented on the Together Assessments website, with a focus on neurodiversity-friendly design.

**Scope**: This document covers accessibility features, neurodiversity support, WCAG compliance, and testing procedures. For colour system implementation, see [COLOURS.md](./COLOURS.md).

## Table of Contents

1. [Accessibility Settings Panel](#accessibility-settings-panel)
2. [Neurodiversity-Friendly Fonts](#neurodiversity-friendly-fonts)
3. [Dark Mode](#dark-mode)
4. [Text-to-Speech System](#text-to-speech-system)
5. [Responsive Design](#responsive-design)
6. [Semantic HTML](#semantic-html)
7. [Keyboard Navigation](#keyboard-navigation)
8. [ARIA Labels](#aria-labels)
9. [Colour Contrast](#colour-contrast)

---

## Accessibility Settings Panel

The site features a unified accessibility settings panel that provides users with centralised control over their viewing preferences. This panel consolidates multiple accessibility features into a single, easy-to-access interface.

### Accessing the Panel

**Location**: Header (top-right corner)

- **Visual Button**: Click the accessibility icon (person in circle) in the site header
- **Keyboard Shortcut**: `Ctrl + Shift + A` (Windows/Linux) or `Cmd + Shift + A` (Mac)
- **Label**: "Accessibility Settings" or "Accessibility" (depending on screen size)

The button appears in both mobile and desktop navigation with synchronised state across all instances.

### Panel Features

The accessibility panel includes the following controls:

#### 1. Font Selection

**Status**: Fully Implemented

Three neurodiversity-friendly font options with visual preview:

- **Sylexiad Sans** (default) - General neurodiversity support
- **OpenDyslexic** - Specialised dyslexia support
- **Fast Sans** - Quick reading optimisation

Font names are displayed in their own typeface, allowing users to preview the font before selection. Selected font applies instantly across the entire site.

See [Neurodiversity-Friendly Fonts](#neurodiversity-friendly-fonts) section for detailed implementation.

#### 2. Theme Selection

**Status**: Fully Implemented

Three colour scheme options:

- **Light** - High contrast with dark text on light background
- **Dark** - Reduced brightness with light text on dark background
- **System** - Automatically matches operating system preference

Theme changes apply instantly and persist across sessions.

See [Dark Mode](#dark-mode) section and [COLOURS.md](./COLOURS.md) for detailed implementation.

#### 3. Text Size

**Status**: Fully Implemented

Five text size options with visual size representation in button labels:

- **XS (Extra Small)** - 87.5% of base size (14px equivalent)
- **SM (Small)** - 93.75% of base size (15px equivalent)
- **Base (Normal)** - 100% of base size (16px equivalent) - Default
- **LG (Large)** - 112.5% of base size (18px equivalent)
- **XL (Extra Large)** - 125% of base size (20px equivalent)

Text size changes apply instantly to:

- Body text content (paragraphs, list items, table cells)
- Headings (scaled proportionally to maintain hierarchy)
- Accessibility panel content itself
- All user-facing text across the site

Button labels display in their representative sizes (e.g., the "A+" button for XL shows larger text than the "A-" button for XS), providing immediate visual preview of each size option.

**Implementation**: Uses CSS custom property `--aw-text-size-scale` to scale font sizes dynamically. See [COLOURS.md](./COLOURS.md#text-size-scaling) for technical implementation details.

#### 4. Line Height

**Status**: Fully Implemented

Three line spacing options for improved readability:

- **Compact** - 1.2x line height - Tighter spacing for users who prefer denser text
- **Normal** - 1.5x line height (WCAG recommended, default) - Standard spacing meeting WCAG 2.1 SC 1.4.12 Level AA
- **Relaxed** - 2.0x line height - Wider spacing for improved readability and tracking

Line height changes apply instantly to all body text elements (paragraphs, list items, blockquotes, table cells) whilst excluding UI elements (buttons, navigation, headers) to maintain proper interface spacing. Headings maintain a fixed 1.2x line height for visual hierarchy.

**WCAG Compliance**: Default setting (Normal, 1.5x) meets WCAG 2.1 Success Criterion 1.4.12 (Level AA) which recommends line spacing of at least 1.5 times the font size for body text.

**Implementation**: Uses CSS custom property `--aw-line-height-scale` applied via body classes (`.line-height-compact`, `.line-height-normal`, `.line-height-relaxed`). See `src/components/CustomStyles.astro:244-342` for complete CSS implementation.

#### 5. Reading Ruler

**Status**: Fully Implemented

Toggle switch to enable/disable a reading ruler (line guide) with a draggable handle, helping users with dyslexia, visual processing difficulties, ADHD, and low vision focus on one line of text at a time.

**Features**:

- **Draggable handle approach** - 40px-wide purple handle on the left side with vertical drag and drop repositioning
- **Visual line indicator** - Different styles for light and dark modes:
  - **Light mode**: 3px dark horizontal line at the bottom of the ruler (`border-bottom: 3px solid rgba(0, 0, 0, 0.8)`) - creates a true "ruler" effect under the text without obscuring readability
  - **Dark mode**: Semi-transparent lavender background highlight (`rgba(230, 230, 250, 0.2)`) - better contrast in dark environments
- **Dynamic height scaling** - Automatically adapts to BOTH user's text size setting (0.875x to 1.25x) AND line height setting (1.2x to 2.0x), with an additional 20% height increase for easier tracking
- **Tabler icon** - Uses `arrows-move-vertical` SVG icon in the draggable handle for clear visual affordance
- **Touch and mouse support** - Drag with mouse or touch, with visual feedback (hover, active, dragging states)
- **Keyboard accessibility** - Arrow keys (Up/Down) move ruler in 10px increments, full ARIA support (`role="slider"`, `aria-orientation="vertical"`)
- **Body padding system** - When ruler is active, adds 40px left padding to body and a vertical divider line at 40px to visually separate the ruler control area from content
- **Mobile menu support** - Adds padding to mobile navigation menu (when expanded) and mobile accessibility panel to prevent ruler handle from covering text
- **Non-intrusive** - Ruler highlight has pointer events disabled, doesn't block clicks or interactions; only handle is interactive
- **Performance optimised** - Only loads JavaScript when enabled, cleanup on page transitions

**How it works**:
The ruler uses a fixed-position container with a draggable purple handle (40px wide) and a highlight area that spans the full viewport width. In light mode, the highlight uses a bottom border to create an underline effect. In dark mode, it uses a background colour for better visibility. The handle can be dragged vertically to reposition the ruler anywhere on the page.

When the ruler is active, the entire page shifts 40px to the right to prevent content from being covered by the handle. A subtle vertical divider line at the 40px mark clearly demarcates the ruler control area from the content area.

**Height calculation**: `16px (base font) × text size scale × line height scale × 1.2 (20% larger)`

- Example: Base text + Normal line height = 16 × 1.0 × 1.5 × 1.2 = 28.8px
- Example: XL text + Relaxed line height = 16 × 1.25 × 2.0 × 1.2 = 48px

**Accessibility**:

- Full ARIA support: `role="slider"`, `aria-orientation="vertical"`, `aria-label="Drag to reposition reading ruler"`, `tabindex="0"`
- Keyboard navigation: Arrow Up/Down keys move ruler in 10px steps
- Visual affordance: Clear drag handle with hover and active states
- Touch-friendly: 40px touch target, prevents scrolling during drag
- Toggle fully keyboard accessible
- Works in both light and dark themes with theme-appropriate styling
- Respects reduced motion preferences (disables transitions)
- Scales appropriately with all text size and line height combinations

**Implementation**:

- CSS: `src/components/common/AccessibilityPanel.astro:477-583` (ruler styles, body padding, vertical divider, mobile menu padding)
- JavaScript: `src/components/common/AccessibilityPanel.astro:927-1273` (ruler creation, drag handlers, height calculation, keyboard support, Astro view transitions cleanup)

#### 6. Text-to-Speech

**Status**: Fully Implemented

Button to trigger text-to-speech playback of the current page content using the browser's Web Speech API.

**Features**:

- **Content extraction** - Blacklist-based approach reads all visible text in the main content area, excluding UI chrome (navigation, buttons, forms, etc.)
- **British English voice selection** - Automatically selects en-GB voices when available, with preference for specific voice names (serena, kate, susan, fiona, stephanie) and voices tagged 'female' by the browser API
- **Collapsible player** - 48px tall purple tab at bottom centre of page with play/pause/stop controls
  - **Collapsed state**: Minimal tab showing "Listening" status with sound icon and chevron
  - **Expanded state**: Full player with play/pause and stop buttons
  - **Minimize button**: Down chevron to collapse player whilst keeping audio playing
  - **Close button**: X button to stop playback and close player
- **Page clearance** - Adds 60px bottom padding to body, footer, navigation menu, and accessibility panel when player is visible to prevent content being covered by the tab
- **Voice pre-loading** - Triggers voice list loading when accessibility panel opens to eliminate delay when starting playback
- **Navigation handling** - Stops playback and hides player when navigating to new page; fresh DOM element references prevent stale reference bugs during Astro view transitions
- **Keyboard support** - Escape key closes player and stops playback

**How it works**:

When the user clicks "Listen to This Page", the system:

1. Loads the TTS player module lazily (only on first use)
2. Extracts all visible text from the main content area using TreeWalker
3. Selects the best available British English voice
4. Creates a SpeechSynthesisUtterance and starts playback
5. Shows collapsed player tab at bottom of page
6. User can click tab to expand controls, minimize to collapse whilst playing, or close to stop

The player uses a getter pattern to query DOM elements fresh on every access, preventing stale reference bugs during Astro view transitions.

**Content extraction logic**:

Uses TreeWalker to traverse all text nodes in the main content area, only excluding:

- Navigation menus (`nav`)
- Headers and footers (`header`, `footer`)
- Sidebars (`aside`)
- Buttons, forms, and form inputs
- Hidden elements (`[aria-hidden="true"]`, `[hidden]`)
- The TTS player itself (`.tts-player`)
- Toggle menus and accessibility controls

This blacklist approach ensures all visible content is read, including links, headings, paragraphs, list items, and span text that whitelist approaches often miss.

**Accessibility**:

- Full keyboard support with Escape key to close
- ARIA labels on all controls (Play/Pause/Stop/Close)
- `aria-pressed` state on play/pause button
- `aria-hidden` attribute controls player visibility
- Status text updates ("Listening to Page", "Playing")
- Works in both light and dark themes

**Browser compatibility**:

- Requires Web Speech API support (Chrome, Edge, Safari, Firefox)
- Falls back gracefully with alert message if not supported
- Handles browser-specific voice loading patterns (Chrome async, Firefox sync)

**Implementation**:

- **Player UI**: `src/components/common/TTSPlayer.astro` (collapsible player component with tab, controls, and styles)
- **TTS Logic**: `src/scripts/tts-player.ts` (TypeScript class handling Web Speech API, content extraction, voice selection, state management)
- **Integration**: `src/components/common/AccessibilityPanel.astro:186-195` ("Listen to This Page" button in accessibility panel)
- **Layout**: Player component included in `src/components/widgets/Header.astro` and page layouts

**Hover consistency**:

The "Listen to This Page" button uses `hover:bg-secondary` to match the hover behaviour of other primary buttons on the site (e.g., "Book a free 15-minute consultation"), ensuring consistent user experience across all primary action buttons.

#### 7. Reset to Defaults

**Status**: Fully Implemented

Button that resets all accessibility settings to their default values:

- Font: Sylexiad Sans
- Theme: System
- Text Size: Base
- Line Height: Normal
- Reading Ruler: Off
- Text-to-Speech: Stopped (if playing)

### Technical Implementation

**Components**:

1. **`src/components/common/ToggleAccessibility.astro`** - Header button component (Lines 7-17)
   - Uses `data-accessibility-toggle` attribute (not ID) to support multiple instances
   - Includes ARIA attributes for screen reader support
   - Visible in both mobile and desktop navigation
   - Responsive icon sizing:
     - Mobile/Tablet (< 1280px): 24px icon (larger for easier touch targets)
     - Desktop (≥ 1280px): 20px icon (balanced with "Accessibility" text label)

2. **`src/components/common/AccessibilityPanel.astro`** - Main panel component
   - Slide-in panel with backdrop overlay
   - Focus trap for keyboard navigation
   - Event delegation to handle all toggle buttons
   - Persistent settings via localStorage

3. **`src/components/common/AccessibilitySettings.ts`** - TypeScript utility
   - Defines settings interface and types
   - Provides default values
   - Type-safe settings management

**Settings Persistence**:

All settings are stored in localStorage under the key `accessibility-preferences`:

```typescript
interface AccessibilitySettings {
  font: 'sylexiad' | 'opendyslexic' | 'fast';
  theme: 'light' | 'dark' | 'system';
  textSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  lineHeight: 'compact' | 'normal' | 'relaxed';
  readingRuler: boolean;
}
```

Settings persist across sessions and are automatically applied on page load.

**Event Delegation Pattern**:

The panel uses event delegation to handle multiple toggle buttons without duplicate IDs:

```javascript
// Listen for clicks on ANY button with [data-accessibility-toggle]
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-accessibility-toggle]');
  if (!target) return;

  // Toggle panel and sync aria-expanded on ALL buttons
  const allToggleButtons = document.querySelectorAll('[data-accessibility-toggle]');
  allToggleButtons.forEach((btn) => {
    btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  });
});
```

This approach ensures that:

- Multiple toggle buttons can exist (mobile + desktop views)
- All buttons stay synchronised
- No duplicate ID conflicts
- Works with dynamic content

**Astro View Transitions Compatibility**:

The site uses Astro's ClientRouter (View Transitions API) for client-side navigation. The accessibility panel has been designed to work seamlessly across page navigations:

Location: `src/components/common/AccessibilityPanel.astro:514-826`

```javascript
// Main initialization function - called on initial load AND after each navigation
function initializeAccessibilityPanel() {
  currentSettings = getSettings();
  applySettings(currentSettings);
  updateUI(currentSettings);
}

// Run on initial page load
initializeAccessibilityPanel();

// Re-initialize after each client-side navigation
document.addEventListener('astro:page-load', () => {
  initializeAccessibilityPanel();
});
```

All event listeners use document-level event delegation (as described above) which persists across page navigations. When a user navigates to a new page:

1. Event listeners remain active (attached to document, not page-specific elements)
2. `astro:page-load` event fires
3. Settings are reloaded from localStorage
4. UI state is updated to match current settings
5. All controls remain functional

This ensures the accessibility panel opens correctly and all controls (text size, font, theme, etc.) work after navigation, without requiring page refresh.

**Focus Trap**:

When the panel opens, keyboard focus is trapped within the panel:

- `Tab` cycles forward through controls
- `Shift + Tab` cycles backward
- `Esc` closes the panel and returns focus to the toggle button
- Focus cannot escape the panel while open

**Responsive Behaviour**:

- **Desktop/Tablet** (768px+): Slides in from the right side
- **Mobile** (< 768px): Slides up from the bottom
- **Backdrop**: Semi-transparent overlay with backdrop blur effect
- **Width**: 320px on desktop/tablet, full width on mobile

**Keyboard Accessibility**:

- All controls fully keyboard accessible
- Focus indicators on all interactive elements
- Radio buttons and toggle switches support arrow key navigation
- `Enter` and `Space` activate buttons
- `Esc` closes the panel

**ARIA Attributes**:

```html
<aside
  id="accessibility-panel"
  role="dialog"
  aria-modal="true"
  aria-label="Accessibility Settings"
  class="accessibility-panel"
></aside>
```

- `role="dialog"` - Identifies as modal dialog
- `aria-modal="true"` - Indicates modal behaviour
- `aria-label` - Provides context for screen readers
- `aria-expanded` - Dynamically updated on toggle buttons

### Usage for Developers

**Adding the Panel to a Layout**:

```astro
---
import ToggleAccessibility from '~/components/common/ToggleAccessibility.astro';
import AccessibilityPanel from '~/components/common/AccessibilityPanel.astro';
---

<header>
  <!-- Other header content -->
  <ToggleAccessibility />
</header>

<!-- Panel renders once, outside header -->
<AccessibilityPanel />
```

**Reading Settings in JavaScript**:

```javascript
const settings = JSON.parse(
  localStorage.getItem('accessibility-preferences') ||
    JSON.stringify({
      font: 'sylexiad',
      theme: 'system',
      textSize: 'base',
      lineHeight: 'normal',
      readingRuler: false,
    })
);
```

**Applying Custom Settings**:

```javascript
// Example: Listen for settings changes
window.addEventListener('storage', (e) => {
  if (e.key === 'accessibility-preferences') {
    const newSettings = JSON.parse(e.newValue);
    // Apply your custom logic here
  }
});
```

---

## Neurodiversity-Friendly Fonts

The site implements a custom font system allowing users to select their preferred reading font, with a focus on neurodiversity and dyslexia support.

### Available Fonts

1. **Sylexiad Sans Medium** (default)
   - Designed for readability with neurodiversity in mind
   - Set as `--aw-font-sans` and `--aw-font-serif`
   - Used for body text and general content

2. **OpenDyslexic3**
   - Specialised font designed to reduce reading errors for dyslexic readers
   - Weighted bottoms help prevent letter confusion
   - Increases letter height and spacing

3. **Fast Sans**
   - Optimised for quick reading and reduced eye strain
   - Clean, modern design
   - OpenType contextual alternates (calt) feature for letter highlighting

4. **Together Assessments** (brand font)
   - Custom font specific to the Together brand
   - Used for headings only (`--aw-font-heading`)
   - Not user-selectable (remains consistent for branding)

### Implementation

**Font Definitions**

Location: `src/components/CustomStyles.astro:24-70`

```css
@font-face {
  font-family: 'Sylexiad Sans Medium';
  src:
    url('/fonts/SylexiadSansMedium.woff2') format('woff2'),
    url('/fonts/SylexiadSansMedium.woff') format('woff'),
    url('/fonts/SylexiadSansMedium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
  size-adjust: 120%;
}

/* Similar @font-face rules for other fonts */
```

**CSS Custom Properties**

Location: `src/components/CustomStyles.astro:81-84`

```css
:root {
  --aw-font-sans: 'Sylexiad Sans Medium', ui-sans-serif, system-ui, sans-serif;
  --aw-font-serif: 'Sylexiad Sans Medium', ui-serif, Georgia, serif;
  --aw-font-heading: 'Together Assessments', ui-sans-serif, system-ui, sans-serif;
}
```

**Tailwind Configuration**

Location: `tailwind.config.js:23-27`

```javascript
fontFamily: {
  sans: ['var(--aw-font-sans, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
  serif: ['var(--aw-font-serif, ui-serif)', ...defaultTheme.fontFamily.serif],
  heading: ['var(--aw-font-heading, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
}
```

**Font Selection Interface**

Location: `src/components/common/AccessibilityPanel.astro`

The font selection interface is part of the Accessibility Settings panel:

- **Visual Preview**: Font names are displayed in their own typeface, allowing users to see what each font looks like before selecting it
- **Radio Button Selection**: Three font options with clear labels
- **Instant Application**: Selected font is immediately applied to the page
- **Persistent Preference**: Choice saved to localStorage and persists across sessions

**Font Selection HTML**:

```html
<label class="accessibility-radio-label">
  <input type="radio" name="font" value="sylexiad" />
  <span class="font-preview" style="font-family: 'Sylexiad Sans Medium', sans-serif;"> Sylexiad Sans </span>
</label>
```

**Font Switching Logic**

Location: `src/components/common/AccessibilityPanel.astro:781-790`

```javascript
function applyFont(font) {
  const fonts = {
    sylexiad: 'Sylexiad Sans Medium, ui-sans-serif, system-ui, -apple-system',
    opendyslexic: 'OpenDyslexic3, ui-sans-serif, system-ui, -apple-system',
    fast: 'Fast Sans, ui-sans-serif, system-ui, -apple-system',
  };

  document.documentElement.style.setProperty('--aw-font-sans', fonts[font]);
}
```

### Font Files

**Location**: `public/fonts/`

**Formats provided**:

- `.woff2` - Modern browsers (primary)
- `.woff` - Fallback for older browsers
- `.ttf` - Ultimate fallback

**Font Loading Strategy**:

The site uses a two-tier font loading approach optimised for performance:

**Critical Fonts (Preloaded)**:

Location: `src/components/CustomStyles.astro:20-22`

```html
<link rel="preload" href="/fonts/TogetherAssessments-Regular.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/SylexiadSansMedium.woff2" as="font" type="font/woff2" crossorigin />
```

These fonts are preloaded because:

- **TogetherAssessments**: Brand font used for all headings site-wide
- **Sylexiad Sans Medium**: Default body font (majority of users)
- **Performance**: Both use `font-display: block` to prevent CLS (Cumulative Layout Shift)

**Accessibility Fonts (Lazy Loaded)**:

Location: `src/components/common/AccessibilityPanel.astro:672-717`

OpenDyslexic and Fast Sans are loaded on-demand using the CSS Font Loading API:

- **When**: Only loaded when user opens accessibility panel OR has saved preference
- **Why**: Saves 336KB bandwidth for users who never use accessibility fonts (majority)
- **Zero network impact**: Fonts don't appear in critical render path
- **Implementation**: JavaScript `loadAccessibilityFonts()` function with promise-based loading

**Font preview handling**:

- Sylexiad preview shown immediately (preloaded font)
- OpenDyslexic/Fast Sans previews use opacity transitions:
  - Hidden (`opacity: 0`) until fonts load
  - Smooth fade-in (`opacity: 1, transition: 0.3s`) when ready
  - Instant display if fonts already cached

### Size Adjustments

**Purpose**: Ensure consistent metrics across different fonts

```css
@font-face {
  font-family: 'Sylexiad Sans Medium';
  size-adjust: 120%; /* Slightly larger for readability */
}

@font-face {
  font-family: 'OpenDyslexic3';
  size-adjust: 85%; /* Smaller to compensate for large x-height */
}

@font-face {
  font-family: 'Fast Sans';
  size-adjust: 100%; /* No adjustment needed */
}

@font-face {
  font-family: 'Together Assessments';
  size-adjust: 115%; /* Slightly larger for headings */
}
```

### User Preference Persistence

All accessibility preferences are stored together in `localStorage.accessibility-preferences`:

```javascript
{
  font: 'sylexiad' | 'opendyslexic' | 'fast',
  theme: 'light' | 'dark' | 'system',
  textSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl',
  lineHeight: 'compact' | 'normal' | 'relaxed',
  readingRuler: boolean
}
```

- All preferences persist across sessions
- Applied automatically on page load
- No account required
- Managed centrally through AccessibilityPanel component

### OpenType Features

**Location**: `src/components/CustomStyles.astro:76-79`

```css
body {
  font-feature-settings: 'calt';
  font-variant-ligatures: contextual;
}
```

**Purpose**: Enable Fast Sans letter highlighting feature

- Safari enables by default
- Chrome requires explicit activation
- Only affects fonts with calt feature

---

## Dark Mode

The site supports light/dark colour schemes with user control and system preference detection. This benefits users with:

- Light sensitivity or photophobia
- Visual processing differences
- Migraine triggers from bright screens
- Preference for high-contrast viewing

For complete implementation details, see [COLOURS.md](./COLOURS.md#dark-mode-toggle-mechanism).

---

## Text-to-Speech System

The site implements a comprehensive text-to-speech (TTS) system allowing users to listen to page content read aloud. This feature benefits users with:

- Dyslexia or other reading difficulties
- Visual impairments
- Fatigue or concentration challenges
- Preference for auditory information processing
- Learning disabilities

### Features

**Content Reading**:

- Automatically extracts and reads all visible text content from the current page
- Uses blacklist approach to exclude UI elements (navigation, buttons, forms)
- Includes page headings, paragraphs, list items, and link text
- Adds natural pauses between text blocks

**Voice Selection**:

- **Priority-based scoring system** - Uses curated list of 115 English voices ranked by quality (en-GB > female > quality > en-US > other English)
- **Deterministic selection** - Always selects the same voice given the same available voices (fixes mobile "Rocko" issue)
- **Top priority voices**: Microsoft Sonia, Microsoft Libby, Google UK English Female (high-quality en-GB female voices)
- **Intelligent fallbacks** - Unknown voices scored using same criteria (language, gender, quality) to ensure best available voice selected
- Handles browser-specific voice loading patterns (Chrome async, Firefox sync)

**Player Interface**:

- Collapsible 48px purple tab at bottom centre of page
- Two states:
  - **Collapsed**: Minimal tab showing "Listening" status with sound icon and up chevron
  - **Expanded**: Full controls with play/pause and stop buttons
- Minimize button (down chevron) collapses player whilst keeping audio playing
- Close button (X) stops playback and closes player
- Consistent primary button hover styling matching other site buttons

**Page Integration**:

- Adds 60px bottom padding to prevent tab from covering content:
  - Page footer clearance
  - Navigation menu last items visible
  - Accessibility panel "Reset to Defaults" button accessible
- Transparent background when collapsed (only purple tab visible)
- Works seamlessly across light and dark themes

**Navigation Handling**:

- Stops playback automatically when user navigates to new page
- Player closes and resets on navigation
- Uses getter pattern for DOM references to prevent stale element bugs during Astro view transitions
- Voice list pre-loads when accessibility panel opens to eliminate delay

### User Experience

**Starting Playback**:

1. Open accessibility settings panel (Ctrl/Cmd + Shift + A or header button)
2. Click "Listen to This Page" button
3. Collapsed player tab appears at bottom of page
4. Audio playback starts automatically

**While Playing**:

- Click tab to expand and access controls
- Click minimize button (down chevron) to collapse whilst continuing playback
- Click stop button or X to end playback and close player
- Press Escape key to close player and stop playback
- Navigate to new page to automatically stop playback

**Control Buttons**:

- **Play/Pause**: Toggle button with icon that changes based on state (play icon when paused, pause icon when playing)
- **Stop**: Ends playback, resets to beginning, closes player
- **Minimize**: Collapses player to tab whilst audio continues
- **Close (X)**: Stops playback and closes player

### Technical Implementation

**Components**:

1. **`src/components/common/TTSPlayer.astro`** - Player UI component
   - Collapsible tab with expand/collapse states
   - Play/pause/stop/minimize/close controls
   - Status text updates ("Listening to Page", "Playing")
   - CSS styling for collapsed/expanded states
   - Lazy loading script (only loads when user clicks "Listen to This Page")

2. **`src/scripts/tts-player.ts`** - Core TTS logic (TypeScript class)
   - Web Speech API integration (`speechSynthesis`, `SpeechSynthesisUtterance`)
   - Content extraction with TreeWalker
   - Voice selection and loading
   - State management (idle/playing/paused)
   - DOM element querying with getter pattern (prevents stale references)
   - Event handlers (onstart, onend, onpause, onresume, onerror)

3. **`src/components/common/AccessibilityPanel.astro`** - Integration point
   - "Listen to This Page" button with `data-tts-toggle` attribute (lines 186-195)
   - Click handler for lazy loading and TTS player initialization
   - Voice pre-loading when accessibility panel opens

4. **Layout Integration**:
   - Player component included in `src/components/widgets/Header.astro`
   - Included in page layouts to ensure availability site-wide

**Content Extraction Logic**:

Location: `src/scripts/tts-player.ts:231-290`

Uses TreeWalker to traverse all text nodes in main content area, only excluding:

```javascript
const skipSelector =
  'nav, header, footer, aside, ' +
  '.tts-player, [aria-hidden="true"], [hidden], ' +
  'button, form, input, select, textarea, ' +
  '.toggle-menu, .accessibility-toggle';
```

**Blacklist approach ensures comprehensive coverage**:

- Captures text in links (`<a>`)
- Captures text in headings (`<h1>` to `<h6>`)
- Captures text in paragraphs (`<p>`)
- Captures text in list items (`<li>`)
- Captures text in spans and divs
- Adds periods to text blocks without ending punctuation for natural pauses

**Voice Selection Logic**:

Location: `src/scripts/tts-player.ts:10-125` (VOICE_PRIORITY constant) and `src/scripts/tts-player.ts:350-417` (selectPreferredVoice method)

**Three-Step Selection Algorithm**:

The voice selection process uses a robust three-step algorithm to ensure optimal voice quality:

**Step 1: Language Filtering**

- Filters available voices to only en-GB and en-US languages
- Rejects all other languages (de-DE, es-ES, fr-FR, etc.) to prevent wrong-language voices
- Falls back to any English language (en-AU, en-IN, etc.) if no en-GB/en-US voices available
- Returns null if no English voices at all

**Step 2: Deduplication by Name**

- Groups voices by name (e.g., multiple "Shelley" voices in different languages)
- Prefers en-GB over en-US when duplicate names exist
- Ensures "Shelley en-GB" selected instead of "Shelley de-DE" or "Shelley en-US"
- Critical for iOS/mobile devices which report many duplicate voice names across languages

**Step 3: Priority-Based Scoring**

The system uses a curated list of 115 English voices (`VOICE_PRIORITY` constant) extracted from comprehensive voice database analysis. Each voice entry includes:

```typescript
{
  name: string;           // Primary voice name
  altNames: string[];     // Platform-specific alternative names
  score: number;          // Priority score (0 = highest)
}
```

Each filtered and deduplicated voice is scored:

1. **Voices in VOICE_PRIORITY list**: Matched by primary name OR any altName
   - **Primary names**: "Google UK English 2 (Natural)", "Microsoft Sonia Online", etc.
   - **Alternative names**: "Android Speech Recognition and Synthesis from Google en-gb-x-gba-network", "Chrome OS UK English 2", etc.
   - **Score**: Uses the `score` field from matched entry (0 = highest priority)
   - Top 3 voices:
     - Microsoft Sonia Online (Natural) - English (United Kingdom) - score 0
     - Microsoft Libby Online (Natural) - English (United Kingdom) - score 1
     - Google UK English Female - score 2
   - Total: 115 voices ordered by: en-GB > female > quality (veryHigh > high > normal) > en-US > other English

2. **Unknown voices** (not in priority list): Score = 10000 + fallback score
   - Fallback scoring algorithm (src/scripts/tts-player.ts:312-342):
     - Language: en-GB (0) > en-US (+1000) > other English (+2000) > non-English (+5000)
     - Gender: female (-500 bonus)
     - Preferred names: serena, kate, susan, fiona, stephanie, sonia, libby (-100 to -30 bonus)

**Alternative name matching**: Browsers report platform-specific voice names (e.g., Android reports "Android Speech Recognition and Synthesis from Google en-gb-x-gba-network" instead of "Google UK English 2"). The system matches both primary names and alternative names (altNames) to correctly identify high-priority voices across all platforms (Windows, macOS, Android, Chrome OS, iOS).

**Deterministic selection**: Given the same available voices, the system always returns the same voice (lowest score wins). The three-step filtering process ensures consistent, high-quality voice selection across all platforms and devices.

**Data source**: Voice priorities extracted from `temp/priority-voices.json` (115 voices from Microsoft, Google, Apple platforms scored by language, gender, and quality attributes). Alternative names extracted from comprehensive voice database analysis.

**Astro View Transitions Compatibility**:

Location: `src/components/common/TTSPlayer.astro:395-407` and `src/scripts/tts-player.ts:10-18`

The TTS system handles Astro's view transitions by:

1. **Using getter pattern for DOM references** (prevents stale elements):

   ```typescript
   private get playerElement(): HTMLElement {
     const el = document.getElementById('tts-player');
     if (!el) throw new Error('TTS player element not found');
     return el;
   }
   ```

2. **Reinitializing on navigation**:

   ```javascript
   document.addEventListener('astro:page-load', () => {
     initializePlayerState();
     if (ttsPlayerInstance) {
       ttsPlayerInstance.updateContent();
     }
   });
   ```

3. **Resetting player state**: Player closes and stops playback on navigation

**Accessibility Features**:

- **ARIA labels**: All controls have descriptive labels
- **ARIA pressed state**: Play/pause button indicates current state
- **ARIA hidden**: Controls player visibility to screen readers
- **Keyboard support**: Escape key closes player and stops playback
- **Focus management**: Buttons are keyboard accessible
- **Status updates**: Visual status text ("Listening to Page", "Playing", "Paused")
- **Theme compatibility**: Works in both light and dark themes

**Browser Compatibility**:

Requires Web Speech API support:

- ✓ Google Chrome / Edge (Chromium)
- ✓ Safari / WebKit
- ✓ Firefox
- ✗ Older browsers without Web Speech API support

Falls back gracefully with alert message if API not supported.

### Page Clearance Implementation

Location: `src/components/common/TTSPlayer.astro:264-278`

When TTS player is visible (`aria-hidden='false'`), adds 60px bottom padding to prevent tab from covering content:

```css
/* Body padding for footer clearance */
:global(body:has(.tts-player[aria-hidden='false'])) {
  padding-bottom: 60px;
}

/* Accessibility panel content clearance */
:global(body:has(.tts-player[aria-hidden='false']) .accessibility-panel-content) {
  padding-bottom: calc(1.5rem + 60px) !important;
}

/* Navigation menu clearance */
:global(body:has(.tts-player[aria-hidden='false']) #header nav) {
  padding-bottom: 60px;
}
```

Padding only applies when player is visible, automatically removed when player closes.

### Usage for Developers

**Adding TTS to a Page**:

The TTS player is already included in the Header component and available site-wide. No additional setup needed for standard pages.

**Triggering TTS Programmatically**:

```javascript
// Get TTS player instance (after it's been loaded)
const ttsPlayer = window.ttsPlayer;

// Start playback
if (ttsPlayer) {
  ttsPlayer.start();
}

// Pause playback
if (ttsPlayer && ttsPlayer.isPlaying()) {
  ttsPlayer.pause();
}

// Stop playback
if (ttsPlayer) {
  ttsPlayer.stop();
}
```

**Excluding Content from TTS**:

Add elements to the skip selector in `extractContent()` method, or use existing exclusion attributes:

```html
<!-- Hidden from screen readers and TTS -->
<div aria-hidden="true">This won't be read</div>

<!-- Standard hidden attribute -->
<div hidden>This won't be read</div>

<!-- Using existing skip classes -->
<div class="tts-skip">This won't be read (add to skipSelector)</div>
```

---

## Responsive Design

### Breakpoints

Defined in `tailwind.config.js:8-14`:

```javascript
screens: {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}
```

### Mobile-First Approach

- Base styles for mobile
- Enhanced progressively for larger screens
- Touch-friendly targets (minimum 44x44px)
- Readable text sizes at all breakpoints

### Responsive Navigation

- **Mobile**: Hamburger menu
- **Tablet** (768px-1279px): Compact dropdown menu
- **Desktop** (1280px+): Full horizontal menu

See [WEBSITE.md](./WEBSITE.md#navigation) for navigation structure.

### Responsive Images

All images use Astro's optimisation with:

- Multiple sizes (640px to 6016px)
- `srcset` for resolution selection
- `sizes` attribute for layout hints
- Lazy loading for below-fold images

---

## Semantic HTML

### Structure

- Proper heading hierarchy (`<h1>` to `<h6>`)
- Semantic sectioning elements:
  - `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`
- Lists for groups of items
- Tables for tabular data only

### Landmarks

ARIA landmarks for screen readers:

- `role="banner"` - Site header
- `role="navigation"` - Navigation menus
- `role="main"` - Main content area
- `role="complementary"` - Sidebars
- `role="contentinfo"` - Site footer

### Link Purpose

- Clear link text (no "click here")
- External link indicators
- Button vs link semantics:
  - Links: Navigate to pages
  - Buttons: Trigger actions

---

## Keyboard Navigation

### Focus Indicators

Custom focus styles in Tailwind:

```css
.btn {
  @apply focus:ring-primary focus:ring-offset-primary focus:ring-2 focus:ring-offset-2;
}
```

**Visible focus indicators** on all interactive elements:

- Links
- Buttons
- Form fields
- Dropdowns
- Toggles

### Tab Order

- Logical tab order follows visual layout
- Skip links for main content (future enhancement)
- Focus trapping in accessibility panel modal
- `tabindex="0"` for custom interactive elements
- `tabindex="-1"` for focusable but not tab-able elements

**Focus Trap Implementation**:

The accessibility panel implements focus trapping when open:

- Focus cycles only through panel controls
- `Tab` moves to next control, wrapping to first when reaching last
- `Shift + Tab` moves to previous control, wrapping to last when reaching first
- `Esc` closes panel and returns focus to toggle button
- Focus cannot escape panel boundaries while open

Location: `src/components/common/AccessibilityPanel.astro`

### Keyboard Shortcuts

**Global**:

- `Tab` - Next focusable element
- `Shift + Tab` - Previous focusable element
- `Enter` / `Space` - Activate buttons and links
- `Esc` - Close dropdowns and modals

**Accessibility Panel**:

- `Ctrl + Shift + A` (Windows/Linux) or `Cmd + Shift + A` (Mac) - Open accessibility settings panel
- `Esc` - Close panel and return focus to toggle button
- Arrow keys - Navigate radio button groups
- `Space` - Toggle switches and activate buttons

---

## ARIA Labels

### Images

All CMS image fields include optional alt text fields. When provided, alt text is used; when omitted, sensible fallbacks are used (e.g., page title, excerpt).

**Implementation**: All 8 image locations in the CMS have dedicated `image_alt` fields:

1. **Home Page Hero** (`config.template.yml:106-110`)
2. **FAQs Page Top Content** (`config.template.yml:282-286`)
3. **Services Page Top Content** (`config.template.yml:354-358`)
4. **Consultation Page** (`config.template.yml:438-442`)
5. **Contact Page** (`config.template.yml:482-486`)
6. **Waitlist Page** (`config.template.yml:519-523`)
7. **Text Pages** (`config.template.yml:570-574`)
8. **Blog Posts Featured Image** (`config.template.yml:635-639`)

**CMS Configuration Example**:

```yaml
- label: 'Hero Image'
  name: 'image'
  widget: 'image'
- label: 'Hero Image Alt Text'
  name: 'image_alt'
  widget: 'string'
  required: false
  hint: 'Describe what the image shows (e.g., "Person using laptop in bright office space"). Leave empty for decorative images.'
```

**Fallback Strategy**:

All image rendering templates use fallback chains to ensure images always have alt text:

```typescript
// Hero image
alt={homePageContent.hero.image_alt || 'Hero image'}

// Page images (FAQ, Services, Contact, etc.)
alt={image_alt || title}

// Blog featured images
alt={post?.image_alt || post?.excerpt || 'Blog post featured image'}
```

**Enforcement**: The `Image.astro` component (src/components/common/Image.astro:20-22) throws an error if alt text is undefined or null, ensuring no images render without accessibility text.

**Content Editor Guidance**: Each CMS alt text field includes hints with good/bad examples:

- ✓ Good: "Therapist reviewing assessment notes"
- ✗ Bad: "Image of consultation", "FAQ image"

For complete CMS configuration, see [CMS.md](./CMS.md#image-alt-text-fields).

### Buttons and Controls

**Accessibility settings toggle**:

Location: `src/components/common/ToggleAccessibility.astro`

```html
<button
  data-accessibility-toggle
  type="button"
  aria-label="Accessibility Settings"
  aria-expanded="false"
  aria-controls="accessibility-panel"
>
  <!-- Universal accessibility icon (person in circle) -->
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
  <span class="ml-1 hidden xl:inline">Accessibility</span>
</button>
```

The accessibility panel includes proper ARIA attributes:

- `role="dialog"` - Identifies the panel as a modal dialog
- `aria-modal="true"` - Indicates modal behaviour
- `aria-label="Accessibility Settings"` - Provides context for screen readers
- `aria-expanded` - Dynamically indicates panel open/closed state on toggle buttons
- `aria-controls` - Links toggle button to panel ID

**Modal Dialog Semantic HTML (2025-01-19)**:

Modal panels (accessibility panel and search panel) use semantically correct HTML elements for `role="dialog"`:

```html
<!-- Correct: div with dialog role -->
<div
  id="accessibility-panel"
  class="accessibility-panel"
  role="dialog"
  aria-modal="true"
  aria-label="Accessibility Settings"
></div>
```

**Note**: Previously used `<aside role="dialog">` which was flagged by Lighthouse as semantically incompatible. The `<aside>` element has an implicit role of "complementary" which conflicts with the explicit "dialog" role. Changed to `<div>` in:

- `src/components/common/AccessibilityPanel.astro:10` (accessibility panel)
- `src/components/common/SearchPanel.astro:10` (search panel)

This ensures screen readers correctly announce the panels as modal dialogs without role conflicts.

See [Accessibility Settings Panel](#accessibility-settings-panel) for complete implementation details.

### Dynamic Content

- `aria-live` regions for status updates
- `aria-expanded` on expandable sections
- `aria-hidden` on decorative elements
- `aria-describedby` for additional context

---

## Colour Contrast

### WCAG Compliance

Target: **WCAG 2.1 Level AA**

- Normal text: 4.5:1 minimum contrast ratio
- Large text (18pt+): 3:1 minimum contrast ratio
- UI components: 3:1 minimum contrast ratio

### Colour Palette

**For complete colour documentation, see [COLOURS.md](./COLOURS.md)**

Colours tested for contrast in both light and dark modes:

**Light mode**:

- Primary purple (`rgb(78 35 95)`) on white background
- Text (`rgb(16 16 16)`) on white background
- Muted text (`rgb(16 16 16 / 66%)`) on white background

**Dark mode**:

- Primary purple (`rgb(78 35 95)`) on dark background
- Text (`rgb(229 236 246)`) on dark background (`rgb(18 16 20)`)
- Muted text (`rgb(229 236 246 / 66%)`) on dark background

### Button Colour Contrast (Dark Mode)

**Issue Resolved (2025-01-19)**: Secondary buttons were failing WCAG 2.1 AA contrast requirements in dark mode due to a CSS specificity issue.

**Root Cause**: A global dark mode styling rule for links was overriding button text colours with `!important`:

```css
/* Previous implementation (caused contrast issues) */
.dark a {
  color: var(--aw-color-text-default) !important; /* rgb(229 236 246) = #e5ecf6 */
}
```

This forced button links to use `#e5ecf6` text on `#1d7963` background, producing a 4.45:1 contrast ratio (below the 4.5:1 WCAG AA minimum).

**Solution**: Modified `src/components/CustomStyles.astro:111-121` to exclude button classes from the dark mode link override:

```css
/* Fixed implementation (WCAG compliant) */
.dark a:not(.btn):not(.btn-primary):not(.btn-secondary):not(.btn-tertiary) {
  color: var(--aw-color-text-default) !important;
  font-weight: 700;
  text-decoration: none !important;
}
```

**Result**: Buttons now use proper white text (`#ffffff`) which provides a 5.2:1 contrast ratio, exceeding WCAG 2.1 AA requirements with a comfortable safety margin.

**Affected Elements** (all now compliant):

- Primary CTA buttons
- Secondary action buttons
- Service card "Learn more" links
- FAQ "More FAQs" button

**Testing**: Verified with Google Lighthouse - achieved 100/100 accessibility score in both light and dark themes.

### Non-Colour Indicators

Information not conveyed by colour alone:

- Form validation: Icons + text messages
- Required fields: Asterisk + text label
- Links: Underline on hover/focus
- Buttons: Distinct shape and position

---

---

**Last Updated**: 2025-01-19
