# CMS (Content Management System)

This document provides detailed information about the Decap CMS implementation, configuration, and workflows for the Together Assessments website.

**Scope**: This document focuses on CMS user workflows, editorial process, authentication, and configuration. For multi-site architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md). For site content structure (what pages exist, what content controls what), see [WEBSITE.md](./WEBSITE.md).

## Table of Contents

1. [Overview](#overview)
2. [Local Development](#local-development)
3. [Production Editing](#production-editing)
4. [Editorial Workflow](#editorial-workflow)
5. [Image Management](#image-management)
6. [Authentication](#authentication)
7. [Configuration](#configuration)
8. [Content Organisation](#content-organisation)
9. [Adding New Collections](#adding-new-collections)

---

## Overview

**CMS**: Decap CMS (formerly Netlify CMS)
**Backend**: GitHub with Editorial Workflow
**Access**: `/admin/` route
**Storage**: Git-based (content committed to repository)

### Key Features

- Git-based content management
- Editorial Workflow for controlled publishing
- GitHub OAuth authentication
- Image optimization pipeline
- Markdown editor with rich text support
- Preview templates
- Branch-based drafts (no race conditions)

---

## Local Development

### Starting the CMS Locally

```bash
npm run dev
```

This command runs `concurrently "npx decap-server" "astro dev"` and starts:

1. **Decap CMS proxy server** on port 8081
2. **Astro dev server** on port 4321

### Accessing Local CMS

1. Navigate to `http://localhost:4321/admin/`
2. No authentication required (proxy server handles this)
3. Changes save directly to local files
4. All content collections are editable

### Local Workflow

- Edit content via CMS interface
- Changes write to local file system immediately
- Preview changes in dev server instantly
- Commit changes via Git when ready
- No Editorial Workflow stages in local mode

---

## Production Editing

### Accessing Production CMS

1. Navigate to `https://yoursite.com/admin/`
2. Click "Login with GitHub"
3. Authenticate with GitHub account (requires repository access)
4. Editorial Workflow interface loads

### User Permissions

**Required**: Write access to the GitHub repository

- Repository collaborators can edit
- External contributors need invitation
- Permissions managed via GitHub, not CMS

### Production Workflow Stages

See [Editorial Workflow](#editorial-workflow) section for details.

---

## Editorial Workflow

The CMS uses a three-stage Editorial Workflow before publishing:

### 1. Draft

**Status**: Work in progress

- Initial content creation
- Images uploaded but held in branch
- Changes saved to feature branch (not main)
- Multiple drafts can exist simultaneously
- No build triggered

**Branch naming**: `cms/{collection}/{slug}`

### 2. In Review

**Status**: Ready for review

- Creates Pull Request automatically
- Reviewers can comment on PR
- Preview deploy available (if configured)
- Can move back to Draft for edits
- Still no production build

**GitHub PR**: Automatically created and linked

### 3. Ready

**Status**: Approved and queued

- Content approved by reviewers
- Queued for publishing
- Final check before going live
- Can still move back to In Review
- Still no production build

### 4. Published

**Status**: Live on production

- **Action**: Merges PR to main branch
- **Trigger**: Single production build
- **Result**: Content goes live
- **Images**: Committed to repository
- **History**: Full Git commit history

### Benefits of Editorial Workflow

1. **No Race Conditions** - Single build per publish, not per edit
2. **No Orphaned Images** - Images only committed when content published
3. **Review Process** - Preview and approve changes before going live
4. **Version Control** - Full Git history with meaningful commit messages
5. **Rollback Capability** - Easy reversion through Git if needed
6. **Branch Isolation** - Multiple editors can work without conflicts

---

## Image Management

### Upload Location

**CMS uploads to**: `src/assets/images/`

**Referenced in content as**: `~/assets/images/filename.jpg`

### Automatic Optimization

Images are optimised at build time by Astro's asset pipeline:

- **Formats**: Original + WebP conversion
- **Sizes**: Multiple responsive sizes
  - Breakpoints: 640px, 750px, 828px, 1080px, 1200px, 1920px, 2048px, 3840px, 6016px
- **Attributes**: Proper `srcset` and `sizes` for responsive loading
- **Lazy loading**: Below-fold images load on demand
- **Quality**: Optimised compression (configurable)

### Image Workflow

1. **Upload via CMS** - File uploads to `src/assets/images/` in branch
2. **Draft stage** - Images remain in feature branch
3. **Build preview** - Images optimised for preview deploy
4. **Publish** - Images committed to main branch
5. **Production build** - Final optimised versions generated

### Image Constraints

Configured in `public/admin/config.yml`:

```yaml
media_folder: src/assets/images
public_folder: ~/assets/images
```

Maximum file sizes and formats enforced by CMS configuration per field type.

### Preventing Orphaned Images

Editorial Workflow ensures images are only committed when content is published:

- Draft edits → Images stay in branch
- Discard draft → Branch deleted, images removed
- Publish content → Images committed with content
- Result: No orphaned images in repository

---

## Authentication

### Setup (Netlify Hosted)

**Current setup**: OAuth handled automatically by Netlify

- No additional configuration needed
- Netlify manages GitHub OAuth application
- Users authenticate via GitHub
- Repository permissions determine CMS access

### Just Works

1. User clicks "Login with GitHub" at `/admin/`
2. Redirected to GitHub OAuth
3. GitHub asks for permission
4. User redirected back to CMS
5. Authenticated and ready to edit

### Self-Hosted Alternative

If not using Netlify, GitHub OAuth application required:

1. Create GitHub OAuth App
2. Configure callback URL
3. Set environment variables
4. Update `public/admin/config.yml`

---

## Configuration

### Multi-Site Architecture

**Important**: This project uses a multi-site architecture that generates three separate websites (assessments, adhd, autism) from a single codebase. The CMS configuration is generated at build time based on which site is being built.

**For complete multi-site architecture details**, including how WEBSITE_ID works, environment variables, and site-specific resources, see **[ARCHITECTURE.md](./ARCHITECTURE.md#multi-site-architecture)**.

### CMS Configuration Files

The CMS uses a template-based configuration system:

**Template File (Source of Truth)**:

- **Location**: `public/admin/config.template.yml`
- **Purpose**: Single source of truth for ALL CMS configuration across all three sites
- **Edit THIS file** to modify CMS configuration
- **Placeholders**: `{{WEBSITE_ID}}`, `{{MEDIA_FOLDER}}`, `{{PUBLIC_FOLDER}}`, `{{SITE_URL}}`

**Generated Configuration File**:

- **Location**: `public/admin/config.yml`
- **Purpose**: Auto-generated, site-specific CMS configuration
- ⚠️ **DO NOT EDIT** - Regenerated on every dev/build
- Not version controlled (in `.gitignore`)

**Generation Process**:

- Script: `scripts/generate-cms-config.js`
- Triggered automatically by `predev:*` and `prebuild:*` hooks
- Reads template, replaces placeholders, writes site-specific config

### Main Configuration Structure

**Key sections** in generated `config.yml`:

```yaml
backend:
  name: github
  repo: owner/repo-name
  branch: main
  commit_messages:
    create: 'feat(content/{siteId}): Create {{collection}} "{{slug}}"'

publish_mode: editorial_workflow
local_backend: true

media_folder: src/assets/images/{siteId}
public_folder: ~/assets/images/{siteId}

site_url: https://yoursite.com
display_url: https://yoursite.com

collections:
  # Site-specific collection definitions
```

### Collection Definitions

Collections defined inline in `public/admin/config.template.yml`.

**Collection types**:

- **File collections** - Single configuration files (e.g., Site Settings, Home Page)
- **Folder collections** - Multiple items (e.g., FAQ Items, Blog Posts)

**All collections are site-specific**:

- Each collection's paths include `{{WEBSITE_ID}}` placeholder
- Content kept separate per site (no cross-contamination)
- CMS shows only the current site's content

### Field Types

Decap CMS supports numerous field types:

- **Text fields**: string, text (multiline)
- **Rich content**: markdown, html
- **Media**: image, file
- **Selections**: select, boolean, relation
- **Structured**: list, object
- **Numbers**: number
- **Dates**: datetime, date
- **Hidden**: hidden (auto-set values)

Full documentation: See `decap-cms-docs/` directory

### Image Alt Text Fields

All 8 CMS image fields include optional alt text fields for accessibility:

1. **Home Page Hero** - `hero.image` + `hero.image_alt`
2. **FAQs Page Top Content** - `image` + `image_alt`
3. **Services Page Top Content** - `image` + `image_alt`
4. **Consultation Page** - `image` + `image_alt`
5. **Contact Page** - `image` + `image_alt`
6. **Waitlist Page** - `image` + `image_alt`
7. **Text Pages** - `image` + `image_alt`
8. **Blog Posts** - `image` + `image_alt`

Each `image_alt` field is configured with helpful hints and examples for content editors:

- ✓ Good: "Therapist reviewing assessment notes"
- ✗ Bad: "Image of consultation", "FAQ image"

For complete accessibility implementation and fallback strategy, see [ACCESSIBILITY.md](./ACCESSIBILITY.md#images).

---

## Content Organisation

### Hierarchical Naming Convention

The CMS UI uses "/" in labels to create logical groupings:

**Example**:

- `label: "FAQs Page / Top Content"`
- `label: "FAQs Page / FAQ Items"`
- `label: "Services Page / Service Items"`

**Benefits**:

- Groups related content visually in CMS
- Clear hierarchy in sidebar
- Intuitive navigation for editors

### Collection Naming

**Technical names** use underscores for Astro compatibility:

- File: `faqs_page_top_content`
- Folder: `faqs_page_items`
- File: `services_page_top_content`
- Folder: `services_page_items`

**Display names** use "/" for hierarchy:

- Display: "FAQs Page / Top Content"
- Display: "FAQs Page / FAQ Items"

---

## Adding New Collections

To add a new content type to the CMS:

### 1. Edit CMS Configuration Template

**File**: `public/admin/config.template.yml` (NOT config.yml!)

Add collection definition following hierarchical naming pattern and using `{{WEBSITE_ID}}` placeholder:

```yaml
collections:
  - name: 'new_collection_items'
    label: 'New Collection / Items'
    folder: 'src/content/{{WEBSITE_ID}}/new-collection/items'
    create: true
    fields:
      - { label: 'Title', name: 'title', widget: 'string' }
      - { label: 'Content', name: 'body', widget: 'markdown' }
      - { label: 'Order', name: 'order', widget: 'number', default: 0 }
      - { label: 'Published', name: 'published', widget: 'boolean', default: true }
```

**Important**: Use `{{WEBSITE_ID}}` in all folder paths to ensure collection works for all three sites.

### 2. Create Content Directories

Create directories for ALL three sites:

```bash
mkdir -p src/content/assessments/new-collection/items
mkdir -p src/content/adhd/new-collection/items
mkdir -p src/content/autism/new-collection/items
```

### 3. Define Collection Schema

**File**: `src/content/config.ts`

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const newCollectionItems = defineCollection({
  loader: glob({ pattern: '**/*.{md,yaml}', base: './src/content/new-collection/items' }),
  schema: z.object({
    title: z.string(),
    order: z.number().default(0),
    published: z.boolean().default(true),
  }),
});

export const collections = {
  // ... existing collections
  new_collection_items: newCollectionItems,
};
```

### 4. Use in Pages

```typescript
import { getCollection } from 'astro:content';

const items = await getCollection('new_collection_items', ({ data }) => {
  return data.published === true;
});

const sorted = items.sort((a, b) => a.data.order - b.data.order);
```

### 5. Update Documentation

**Update**: [WEBSITE.md](./WEBSITE.md) to document:

- New collection and what it controls
- Where content appears on site
- Field descriptions

---

## Common CMS Tasks

### Reordering Items

Use the `order` field (lower numbers appear first):

1. Edit item in CMS
2. Change order number
3. Save and publish
4. Items automatically sort by order field in code

### Hiding Content

Use the `published` boolean field:

1. Edit item
2. Toggle "Published" to off
3. Save and publish
4. Item no longer appears on site (filtered in code)

### Preview Before Publishing

1. Move content to "In Review" stage
2. CMS creates Pull Request
3. Netlify creates preview deploy (if configured)
4. Review preview URL in PR
5. Move to "Ready" and then "Publish" when satisfied

### Discarding Drafts

1. Open draft in CMS
2. Click "Delete" button
3. Confirm deletion
4. Branch and draft removed (images cleaned up)

### Bulk Updates

For bulk updates, consider editing files directly:

1. Clone repository locally
2. Edit files in `src/content/` directories
3. Commit and push changes
4. Bypass CMS for efficiency

---

## Troubleshooting

### Can't log in to CMS

- Check GitHub repository access permissions
- Verify Netlify OAuth configuration
- Try incognito/private browser window
- Check browser console for errors

### Images not appearing

- Verify image path uses `~/assets/images/` prefix
- Check image file exists in `src/assets/images/`
- Ensure image committed to main branch (published)
- Try rebuilding site

### Changes not appearing on site

- Check Editorial Workflow stage (must be "Published")
- Verify build completed successfully
- Check deploy logs on Netlify
- Clear browser cache

### CMS showing old structure

- Regenerate config: `cross-env WEBSITE_ID={site} node scripts/generate-cms-config.js`
- Restart dev server: `npm run dev:{site}`
- Clear browser cache and reload `/admin/`
- Check for JavaScript console errors

### CMS showing wrong site's content

- Verify you're running the correct site-specific command (e.g., `npm run dev:assessments`)
- Check generated `public/admin/config.yml` to see which site it's configured for
- Regenerate config for correct site
- Clear browser cache

### Changes to config.template.yml not appearing

- Config is only regenerated when running dev/build commands
- Restart dev server to trigger regeneration
- Verify placeholders (`{{WEBSITE_ID}}`, etc.) are correct in template
- Check generated `config.yml` to see if placeholders were replaced

---

**Last Updated**: 2025-10-25
