# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Together Assessments website built on the AstroWind template (Astro 5.0 + Tailwind CSS). Custom implementation for a neurodiversity assessment service provider.

## Starting a New Session

**IMPORTANT**: At the start of every new session, run the `/start` command to ensure the development server is running cleanly. This will:

- Kill any lingering processes from previous sessions
- Free up ports 8081 and 4321
- Start a fresh dev server
- Ensure both Astro and CMS proxy are running

This prevents port conflicts and ensures you have a clean development environment throughout the session.

## Quick Reference: Where to Find Information

All detailed technical documentation is in the `technical-docs/` folder. Use this guide to know which documentation to reference based on your task:

| Working on...                     | See documentation                                     | Contains                                                  |
| --------------------------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| **Site structure, pages, routes** | [WEBSITE.md](./technical-docs/WEBSITE.md)             | Pages, CMS collections, what controls what                |
| **Components**                    | [CHEATSHEET.md](./technical-docs/CHEATSHEET.md)       | 55+ components with usage examples and props              |
| **Colours, theming, dark mode**   | [COLOURS.md](./technical-docs/COLOURS.md)             | Complete colour system and theme architecture             |
| **Architecture, config, build**   | [ARCHITECTURE.md](./technical-docs/ARCHITECTURE.md)   | Technical architecture, directory structure, build system |
| **CMS, content management**       | [CMS.md](./technical-docs/CMS.md)                     | Decap CMS setup, editorial workflow, adding collections   |
| **Accessibility, fonts**          | [ACCESSIBILITY.md](./technical-docs/ACCESSIBILITY.md) | Neurodiversity features, WCAG compliance, testing         |

**Pro tip**: Always load the relevant technical documentation into your context based on the task you're working on. Don't try to work from memory alone.

---

## Language and Spelling

**IMPORTANT**: All content, code comments, documentation, and user-facing text must be written in **British English**. This includes:

- Spelling (e.g., "colour" not "color", "centre" not "center", "optimise" not "optimize")
- Vocabulary (e.g., "organisation" not "organization", "favourite" not "favorite")
- Date formats (DD/MM/YYYY)
- Any generated content or copy

---

## Essential Commands

### Development

```bash
npm run dev          # Starts BOTH Astro dev server AND CMS proxy server concurrently
                     # Astro: http://localhost:4321
                     # CMS: http://localhost:4321/admin/
                     # Proxy: port 8081

npm run build        # Build production site to ./dist/
npm run preview      # Preview built site locally
```

### Code Quality & Validation

**Automated Pre-Commit Checks:**

The repository uses a git pre-commit hook that automatically enforces code quality:

- `npm run fix` - Auto-fixes all ESLint and Prettier issues
- `npm run check:astro` - Validates TypeScript types in Astro files
- Commits are **blocked** if unfixable linting issues or type errors exist
- Can bypass with `git commit --no-verify` (emergencies only)

**Manual Commands:**

```bash
npm run precommit       # Run pre-commit validation manually (fix + type check)
npm run check           # Read-only validation (for CI) - checks everything without modifying
npm run fix             # Auto-fix ESLint and Prettier issues
npm run check:astro     # Type-check Astro files only
npm run check:eslint    # Check ESLint rules only
npm run check:prettier  # Check Prettier formatting only
```

**Development Workflow:**

1. Write code as normal
2. Commit when ready - pre-commit hook runs automatically
3. Hook auto-fixes formatting and validates types
4. Commit proceeds if all checks pass, blocked if issues remain
5. Review any auto-fixes in `git diff` if commit was blocked

**For CI/CD:** Use `npm run check` for comprehensive read-only validation without modifying files.

---

## Development Tools

### Playwright MCP (Browser Automation)

Playwright is available via MCP for visual debugging and verification.

**When to use:**

- Debugging visual issues and layout problems
- Verifying UI component implementations
- Testing responsive designs at different viewport sizes
- Capturing screenshots for documentation or bug reports

**Common workflow:**

1. Start dev server: `/start` command
2. Navigate to page: `browser_navigate` to http://localhost:4321
3. Inspect structure: `browser_snapshot` (better than screenshots for most debugging)
4. Capture visual: `browser_take_screenshot` when needed
5. Debug JavaScript: `browser_evaluate` and `browser_console_messages`

### Plan Oversight Reviewer Agent

The plan-oversight-reviewer agent provides continuous review and support when implementing complex work from a plan file. It verifies that implementations match documented plans and function correctly for end users.

**When to use:**

- **ALWAYS** when implementing complex work from a plan file (e.g., `temp/ACCESSIBILITY-CONTROLS-MENU-PLAN.md`)
- At key implementation stages where you want verification
- When you've completed a significant phase or component
- When you need guidance on whether you're on track with the plan
- When you want to test that functionality works as intended for users

**Important:**

- **Always start by referencing the plan file** you're working from so the agent knows the plan
- Use throughout implementation, not just at the end
- The agent provides continuous review and support at each stage
- The agent will test user functionality and provide feedback
- Use this agent proactively - don't wait to be asked

**Common workflow:**

1. Start implementing work following a plan document
2. At key stages, launch plan-oversight-reviewer agent via Task tool
3. Reference the plan file path in your prompt to the agent
4. Agent reviews progress against plan and tests functionality
5. Agent reports on alignment, issues, and recommendations
6. Address feedback and continue to next stage
7. Repeat review at subsequent key stages until complete

---

## Port Cleanup

Dev servers automatically free ports 4321 and 8081 before starting via `predev:*` hooks.

**If you get EADDRINUSE errors**: `/stop` or `npx kill-port 4321 8081`

---

## Working with Content

### Adding/Editing Content

**For content editors**: Use the CMS at `/admin/`

**For developers adding new pages or collections**:

1. **Read** [WEBSITE.md](./technical-docs/WEBSITE.md) to understand current site structure
2. **Read** [CMS.md](./technical-docs/CMS.md) section on "Adding New Collections"
3. Create content directory in `src/content/`
4. Define schema in `src/content/config.ts`
5. Configure CMS in `public/admin/config.yml`
6. Create page route in `src/pages/` (if needed)
7. **Update** [WEBSITE.md](./technical-docs/WEBSITE.md) to document the new content

---

## Working with Components

### Using Existing Components

1. **Read** [CHEATSHEET.md](./technical-docs/CHEATSHEET.md) for complete component documentation
2. Search for the component name to find usage examples
3. Copy the example and modify props as needed
4. All 55+ components documented with props and examples

### Creating New Components

1. Create component file in appropriate `src/components/` subdirectory:
   - `widgets/` - Page sections
   - `ui/` - UI primitives
   - `common/` - Shared utilities
   - `blog/` - Blog-specific
2. Follow existing component patterns
3. **Update** [CHEATSHEET.md](./technical-docs/CHEATSHEET.md) with usage example and props

---

## Working with Styles

### Colours and Theming

**Task**: Changing colours, adding new theme colours, or modifying dark mode

1. **Read** [COLOURS.md](./technical-docs/COLOURS.md) for complete colour architecture
2. Edit CSS custom properties in `src/components/CustomStyles.astro`
3. Colours defined in `:root` (light mode) and `.dark` (dark mode)
4. Changes propagate automatically through Tailwind utilities

### Other Styling

- Custom styles: `src/components/CustomStyles.astro`
- Tailwind utilities: `src/assets/styles/tailwind.css`
- Config: `tailwind.config.js`
- Follow existing Tailwind utility patterns

---

## Working with Accessibility

**Task**: Adding fonts, improving accessibility, or implementing WCAG features

1. **Read** [ACCESSIBILITY.md](./technical-docs/ACCESSIBILITY.md)
2. Neurodiversity-friendly fonts configured in `CustomStyles.astro`
3. Font switcher in `ToggleFont.astro`
4. Test with keyboard navigation and screen readers

---

## Working with Architecture

**Task**: Understanding configuration, build system, or technical architecture

1. **Read** [ARCHITECTURE.md](./technical-docs/ARCHITECTURE.md)
2. Configuration: `src/config.yaml` (overrides astro.config.ts)
3. Content collections: `src/content/config.ts`
4. Directory structure and key technologies documented

---

## Version Control

**Note**: Commits and pull requests are handled by the user, not Claude Code. Code changes should be made and tested, but Git operations are outside Claude's scope.

---

## Maintaining Documentation

**IMPORTANT**: When adding new features, pages, or CMS collections, update the appropriate technical documentation.

### Documentation Structure

All technical documentation is in `technical-docs/`:

1. **[WEBSITE.md](./technical-docs/WEBSITE.md)** - Site structure and content
   - Update for new pages and routes
   - Update for new CMS collections
   - Update for navigation changes
   - Update for configuration options

2. **[CHEATSHEET.md](./technical-docs/CHEATSHEET.md)** - Component reference
   - Update when adding new components
   - Update when modifying component props or behaviour
   - Update when changing component usage patterns

3. **[COLOURS.md](./technical-docs/COLOURS.md)** - Colour system and theming
   - Update when adding or changing theme colours
   - Update when modifying colour architecture
   - Update when changing dark mode implementation

4. **[ARCHITECTURE.md](./technical-docs/ARCHITECTURE.md)** - Technical architecture
   - Update for technical architecture changes
   - Update for configuration system changes
   - Update for build system or deployment changes
   - Update for new integrations or tools

5. **[CMS.md](./technical-docs/CMS.md)** - Content management
   - Update for CMS configuration changes
   - Update for editorial workflow changes
   - Update for new collection types

6. **[ACCESSIBILITY.md](./technical-docs/ACCESSIBILITY.md)** - Accessibility features
   - Update for new accessibility features
   - Update for font system changes
   - Update for WCAG compliance changes

7. **CLAUDE.md** (this file) - Developer guidance
   - Update for new development workflows or commands
   - Update for new tools or integrations
   - Keep focused on WHERE to find information, not WHAT the information is

### Documentation Philosophy

- **WEBSITE.md** = What the site contains (content-focused)
- **CHEATSHEET.md** = How to use components (implementation-focused)
- **COLOURS.md** = How to work with colours and themes (design system-focused)
- **ARCHITECTURE.md** = How the codebase is structured (architecture-focused)
- **CMS.md** = How to manage content (workflow-focused)
- **ACCESSIBILITY.md** = How to maintain accessibility (compliance-focused)
- **CLAUDE.md** = Where to find information (guidance-focused)

---

## Reference Documentation

- **Template Examples**: Original AstroWind examples in `src/reference-examples/` for component patterns
- **Decap CMS Documentation**: Local docs in `decap-cms-docs/` for CMS configuration reference

---

## Pro Tips for Claude Code

1. **Always load relevant docs first**: Before working on a task, load the appropriate technical documentation from `technical-docs/` into your context. Don't work from memory alone.

2. **Be specific about what you're working on**: If you're working on colours, load COLOURS.md. If you're working on CMS, load CMS.md. The more specific, the better.

3. **Cross-reference documentation**: Many features span multiple docs (e.g., accessibility fonts touch ACCESSIBILITY.md, COLOURS.md, and ARCHITECTURE.md). Load all relevant docs.

4. **Update docs as you work**: If you're making changes that should be documented, update the relevant technical documentation file as part of your task.

5. **When in doubt, ask**: If you're unsure which documentation to reference, ask the user for clarification about what aspect of the site you're working on.

---

**Last Updated**: 2025-10-11
