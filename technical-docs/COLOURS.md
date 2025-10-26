# Colour Scheme Architecture

This document provides a comprehensive overview of the light/dark colour system used throughout the Together Assessments website.

**Scope**: This document covers the colour system, theming architecture, and dark mode implementation. For accessibility testing and WCAG compliance, see [ACCESSIBILITY.md](./ACCESSIBILITY.md).

## Architecture Overview

The colour system uses a hierarchical architecture with CSS custom properties at its core, ensuring consistent theming across light and dark modes.

### Architecture Flow

```
1. CustomStyles.astro
   └─> Defines CSS variables (--aw-color-*)
        ↓
2. tailwind.config.js
   └─> Maps variables to Tailwind utilities (primary, accent, etc.)
        ↓
3. tailwind.css
   └─> Adds custom utility classes (.bg-page, .text-muted)
        ↓
4. Components
   └─> Use Tailwind utilities (text-primary, dark:bg-accent)
```

## Layer 1: CSS Custom Properties (Source of Truth)

**Location**: `src/components/CustomStyles.astro:81-120`

### Light Mode (`:root`)

```css
--aw-color-primary: rgb(78 35 95) /* Purple */ --aw-color-secondary: rgb(65 28 80) /* Darker purple */
  --aw-color-accent: rgb(29 121 99) /* Teal/green */ --aw-color-text-heading: rgb(0 0 0) /* Black */
  --aw-color-text-default: rgb(16 16 16) /* Near black */ --aw-color-text-muted: rgb(16 16 16 / 66%)
  /* Grey (66% opacity) */ --aw-color-bg-page: rgb(255 255 255) /* White */ --aw-color-bg-page-dark: rgb(18 16 20)
  /* Dark background */;
```

### Dark Mode (`.dark`)

```css
--aw-color-primary: rgb(78 35 95) /* Purple (same) */ --aw-color-secondary: rgb(65 28 80) /* Darker purple (same) */
  --aw-color-accent: rgb(29 121 99) /* Teal/green (same) */ --aw-color-text-heading: rgb(247 248 248) /* Off-white */
  --aw-color-text-default: rgb(229 236 246) /* Light blue-white */ --aw-color-text-muted: rgb(229 236 246 / 66%)
  /* Muted light (66% opacity) */ --aw-color-bg-page: rgb(18 16 20) /* Dark purple-black */;
```

**Key Insight**: Primary, secondary, and accent colours remain **identical** in both modes. Only text and background colours change.

## Layer 2: Tailwind Configuration

**Location**: `tailwind.config.js:16-22`

CSS variables are mapped to Tailwind utility names:

```javascript
colors: {
  primary: 'var(--aw-color-primary)',
  secondary: 'var(--aw-color-secondary)',
  accent: 'var(--aw-color-accent)',
  default: 'var(--aw-color-text-default)',
  muted: 'var(--aw-color-text-muted)',
}
```

**Usage**: `text-primary`, `bg-accent`, `border-secondary`, etc.

## Layer 3: Additional Utility Classes

**Location**: `src/assets/styles/tailwind.css:5-21`

```css
.bg-page {
  background-color: var(--aw-color-bg-page);
}
.bg-dark {
  background-color: var(--aw-color-bg-page-dark);
}
.bg-light {
  background-color: var(--aw-color-bg-page);
}
.text-page {
  color: var(--aw-color-text-page);
}
.text-muted {
  color: var(--aw-color-text-muted);
}
```

## Dark Mode Toggle Mechanism

### Configuration

**Location**: `src/config.yaml:72`

```yaml
ui:
  theme: 'system' # Options: 'system' | 'light' | 'dark' | 'light:only' | 'dark:only'
```

### UI Component

**Location**: `src/components/common/ToggleTheme.astro:24`

- Renders a button with `data-aw-toggle-color-scheme` attribute
- Only shows if theme doesn't end with `:only`

### JavaScript Logic

**Location**: `src/components/common/BasicScripts.astro:67-76`

When toggle button is clicked:

1. Toggles `.dark` class on `document.documentElement`
2. Saves preference to `localStorage.theme` ('dark' or 'light')
3. Calls `Observer.removeAnimationDelay()` to prevent flickering

### Initial Theme Application

**Location**: `src/components/common/ApplyColorMode.astro:8-32`

On page load, determines theme by:

1. If theme is set to `:only` mode → Use that theme
2. Else if `localStorage.theme === 'dark'` → Use dark
3. Else if no localStorage but system prefers dark → Use dark
4. Otherwise → Use light

## Component Usage Examples

### In Components

```html
<!-- Uses primary colour for text -->
<div class="text-primary">...</div>

<!-- Uses accent colour for background -->
<div class="bg-accent">...</div>

<!-- Uses secondary colour in dark mode only -->
<div class="dark:bg-secondary">...</div>

<!-- Different colours in light/dark modes -->
<div class="text-gray-900 dark:text-gray-100">...</div>
```

### In Tailwind CSS

**Location**: `src/assets/styles/tailwind.css:28-29`

```css
.btn-primary {
  @apply btn font-semibold bg-primary text-white border-primary
         hover:bg-secondary hover:border-secondary hover:text-white
         dark:text-white dark:bg-primary dark:border-primary
         dark:hover:border-secondary dark:hover:bg-secondary;
}
```

## Dark Mode Hyperlink Styling

**Location**: `src/components/CustomStyles.astro:111-121`

All hyperlinks (excluding buttons) in dark mode are styled to match the default text colour but with bold weight and no underline:

```css
/* Dark mode hyperlink styling - match text colour but bold */
/* Exclude buttons to preserve their intended colours (WCAG contrast compliance) */
.dark a:not(.btn):not(.btn-primary):not(.btn-secondary):not(.btn-tertiary) {
  color: var(--aw-color-text-default) !important;
  font-weight: 700;
  text-decoration: none !important;
}

.dark a:not(.btn):not(.btn-primary):not(.btn-secondary):not(.btn-tertiary):hover {
  color: var(--aw-color-text-default) !important;
  text-decoration: none !important;
}
```

**Why button exclusions are needed (added 2025-01-19):**

Buttons rendered as `<a>` tags (such as `.btn-secondary`) need to maintain their own colour values for WCAG 2.1 AA contrast compliance. Without the `:not()` exclusions, the `!important` rule would override button text colours, causing contrast failures.

**Why `!important` is needed:**

- Individual components (like Footer) use specific Tailwind classes (e.g., `dark:text-gray-400`)
- These component-specific classes have higher specificity than general `.dark a` rules
- `!important` ensures consistent hyperlink styling across all components in dark mode

**Result:**

- All hyperlinks (except buttons) in dark mode display as `rgb(229, 236, 246)` (light colour)
- All hyperlinks (except buttons) are bold (font-weight: 700)
- No underlines (for cleaner appearance whilst maintaining bold for distinction)
- Buttons maintain their own colours for WCAG compliance (e.g., white text on accent background)

## Hardcoded Colours (Edge Cases)

A few colours are hardcoded outside the main system for specific effects:

1. **Features2.astro:31** - Shadow colours: `rgba(0,0,0,0.1)`, border `#ffffff29`
2. **Favicons.astro:9** - Safari mask icon: `#8D46E7` (purple)
3. **tailwind.css:43, 48** - Header scroll backgrounds: `rgb(140 152 164 / 13%)`, `rgba(18, 16, 20, 0.9)`

These are intentionally hardcoded for specific visual effects and don't need to be part of the main theming system.

## How to Modify Colours

### To Change a Theme Colour

1. Edit `src/components/CustomStyles.astro`
2. Update values in `:root` (light mode) and/or `.dark` (dark mode)
3. No other files need changing - the change propagates automatically through CSS variables!

**Example** - To change primary colour:

```css
:root {
  --aw-color-primary: rgb(120 50 140); /* New purple */
}

.dark {
  --aw-color-primary: rgb(120 50 140); /* Keep same in dark mode */
}
```

### To Add a New Theme Colour

1. Add CSS variable in `CustomStyles.astro`:

   ```css
   :root {
     --aw-color-tertiary: rgb(255 100 50);
   }
   .dark {
     --aw-color-tertiary: rgb(255 120 70); /* Lighter in dark mode */
   }
   ```

2. Map it in `tailwind.config.js`:

   ```javascript
   colors: {
     // ... existing colours
     tertiary: 'var(--aw-color-tertiary)',
   }
   ```

3. Use it in components:
   ```html
   <div class="text-tertiary bg-tertiary border-tertiary">...</div>
   ```

## Colour Palette Reference

### Brand Colours

| Colour    | RGB Value        | Usage                              |
| --------- | ---------------- | ---------------------------------- |
| Primary   | `rgb(78 35 95)`  | Main brand colour (purple)         |
| Secondary | `rgb(65 28 80)`  | Darker brand colour (hover states) |
| Accent    | `rgb(29 121 99)` | Accent colour (teal/green)         |

### Light Mode Text

| Colour  | RGB Value             | Usage                  |
| ------- | --------------------- | ---------------------- |
| Heading | `rgb(0 0 0)`          | Headings (black)       |
| Default | `rgb(16 16 16)`       | Body text (near black) |
| Muted   | `rgb(16 16 16 / 66%)` | Secondary text (grey)  |

### Dark Mode Text

| Colour  | RGB Value                | Usage                        |
| ------- | ------------------------ | ---------------------------- |
| Heading | `rgb(247 248 248)`       | Headings (off-white)         |
| Default | `rgb(229 236 246)`       | Body text (light blue-white) |
| Muted   | `rgb(229 236 246 / 66%)` | Secondary text (muted light) |

### Backgrounds

| Mode  | Colour          | RGB Value                           |
| ----- | --------------- | ----------------------------------- |
| Light | Page background | `rgb(255 255 255)` (white)          |
| Dark  | Page background | `rgb(18 16 20)` (dark purple-black) |

## Best Practices

1. **Always use CSS variables** instead of hardcoding colours (unless for specific effects)
2. **Test in both light and dark modes** when adding new coloured elements
3. **Use Tailwind utilities** (`text-primary`, `bg-accent`) rather than custom CSS when possible
4. **Consider colour contrast** - ensure text is readable in both modes
5. **Use `dark:` prefix** in Tailwind classes for dark-mode-specific styles

## Troubleshooting

### Colour not updating when theme changes

- Check if you're using CSS variables or Tailwind utilities (good)
- Avoid hardcoded colour values in inline styles
- Ensure the `.dark` class is properly applied to `document.documentElement`

### New colour not working

1. Verify CSS variable is defined in both `:root` and `.dark`
2. Check Tailwind config maps the variable correctly
3. Rebuild Tailwind if changes don't appear
4. Clear browser cache if needed

### Colour looks different in dark mode

- This is expected for text and background colours
- Brand colours (primary, secondary, accent) should remain the same
- Check if you need to add a `dark:` variant for the specific element

### Hyperlinks not styled correctly in dark mode

- All hyperlinks should be light colour and bold with no underline in dark mode
- This is handled globally by `.dark a` rules in `CustomStyles.astro:122-132`
- If a component's hyperlinks aren't styled correctly, check if it has component-specific Tailwind classes that override the global rules
- The global rules use `!important` to override most component-specific styles

---

**Last Updated**: 2025-10-25
