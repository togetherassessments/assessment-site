# WEBSITE.md

This document describes the Together Assessments website structure: what pages exist, what can be configured, and where to find content settings. This is a structural/architectural guide - it describes WHAT can be set and WHERE, not the current content values themselves.

For technical implementation details and development workflows, see [CLAUDE.md](./CLAUDE.md).

**Scope**: This document describes site structure and content organisation from a content editor's perspective. For technical implementation details, see [ARCHITECTURE.md](./ARCHITECTURE.md). For CMS workflows, see [CMS.md](./CMS.md).

---

## Table of Contents

1. [Pages](#pages)
2. [Content Management (CMS)](#content-management-cms)
3. [Configuration Files](#configuration-files)
4. [Navigation](#navigation)
5. [Accessibility Features](#accessibility-features)

---

## Pages

The website consists of the following pages:

### Core Pages

| Page              | Route            | Content Source                                   | Description                                                                                                 |
| ----------------- | ---------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| **Homepage**      | `/`              | CMS: Home Page                                   | Main landing page with hero, services preview, how-it-works steps, blog preview, FAQs preview, trust badges |
| **About**         | `/about`         | CMS: Text Pages                                  | Information about the service                                                                               |
| **Services**      | `/services`      | CMS: Services Page / Top Content + Service Items | List of assessment services offered                                                                         |
| **Fees**          | `/fees`          | CMS: Text Pages                                  | Pricing information                                                                                         |
| **FAQs**          | `/faq`           | CMS: FAQs Page / Top Content + FAQ Items         | Frequently asked questions                                                                                  |
| **Contact**       | `/contact`       | CMS: Contact Page                                | Contact page with configurable content and email button                                                     |
| **Consultation**  | `/consultation`  | CMS: Consultation Page                           | Booking page with Google Calendar integration                                                               |
| **Waitlist**      | `/waitlist`      | CMS: Waitlist Page                               | Waitlist form with Google Form integration (not in navigation/footer, accessed via consultation page link)  |
| **Guides & Toolkits** | `/guides-and-toolkits` | CMS: Text Pages                            | Guides and toolkits resources                                                                               |
| **Local Support** | `/local-support` | CMS: Text Pages                                  | Local support information                                                                                   |

### Blog System

| Page                 | Route Pattern               | Content Source                 | Description                                          |
| -------------------- | --------------------------- | ------------------------------ | ---------------------------------------------------- |
| **Blog Index**       | `/blog`                     | Dynamic (from post collection) | Main blog listing with pagination (6 posts per page) |
| **Blog Post**        | `/blog/{slug}`              | CMS: Blog Posts                | Individual blog post pages                           |
| **Category Archive** | `/blog/category/{category}` | Dynamic (from post categories) | Posts filtered by category with pagination           |
| **Tag Archive**      | `/blog/tag/{tag}`           | Dynamic (from post tags)       | Posts filtered by tag with pagination (noindex)      |
| **RSS Feed**         | `/rss.xml`                  | Generated from posts           | RSS feed for blog subscribers                        |

**Blog Configuration:**

- Posts per page: 6 (set in `src/config.yaml`)
- Related posts: Enabled, 4 posts shown (set in `src/config.yaml`)
- SEO: Main blog and categories indexed, tags noindex
- Post URL format: `/blog/{slug}` (configurable in `src/config.yaml`)
- All blog content organized under `/blog/*` prefix for better URL hierarchy

### Policy & Legal Pages

All managed via CMS as Text Pages:

| Page                        | Route                      |
| --------------------------- | -------------------------- |
| **Privacy Policy**          | `/privacy-policy`          |
| **Cookie Policy**           | `/cookie-policy`           |
| **Terms of Service**        | `/terms-of-service`        |
| **Safeguarding**            | `/safeguarding`            |
| **Accessibility Statement** | `/accessibility-statement` |
| **Data Retention & SAR**    | `/data-retention-sar`      |
| **Policies and Downloads**  | `/policies-and-downloads`  |
| **Refunds/Cancellations**   | `/refunds-cancellations`   |
| **Complaints**              | `/complaints`              |
| **Credits**                 | `/credits`                 |

### Special Pages

| Page         | Route  | Description                    |
| ------------ | ------ | ------------------------------ |
| **404 Page** | `/404` | Custom 404 error page (static) |

---

## Content Management (CMS)

All content is managed through Decap CMS at `/admin/`. The CMS is organised hierarchically with the following collections:

**Note:** For CMS editorial workflow and authentication details, see [CMS.md](./CMS.md). For collection schemas and technical details, see [ARCHITECTURE.md](./ARCHITECTURE.md#content-collections).

### Site Settings

**Collection:** Site Settings (file-based)

Controls site-wide information displayed throughout the website:

- **Site Information:**
  - Site name
  - Site email address
  - ICO registration number
  - Waitlist Only Mode toggle (when enabled, all consultation links become waitlist links and /consultation redirects to /waitlist)

- **Logo Settings:**
  - Light mode logo image
  - Dark mode logo image
  - Logo alt text

- **Footer Settings:**
  - Footer title
  - Business information text

**File Location:** `src/content/{siteId}/site-settings.yaml`

Example: `src/content/assessments/site-settings.yaml`

---

**Collection:** Site Settings / Trust Badges (folder-based)

Professional accreditation badges displayed on the homepage:

- Organisation name
- Display text
- Light mode logo
- Dark mode logo
- Alt text
- Display order
- Published status

**File Location:** `src/content/{siteId}/site-settings/trust-badges/`

Example: `src/content/assessments/site-settings/trust-badges/`

---

### Testimonials

**Collection:** Testimonials (folder-based)

Client testimonials displayed on the homepage above the blog section:

- Testimonial text (required, plain text)
- Name (optional - displays "Provided anonymously" if not set)
- Display order
- Published status

**File Location:** `src/content/{siteId}/testimonials/`

Example: `src/content/assessments/testimonials/`

**Display Behaviour:**

- Section only appears when at least one published testimonial exists
- If no testimonials exist, the section is completely hidden
- Testimonials are displayed in a responsive grid:
  - Desktop (1280px+): 3 columns
  - Tablet (768px-1279px): 2 columns
  - Mobile (<768px): Single column
- Each card shows a quote icon, the testimonial text in italics, and the attribution
- Supports both light and dark mode with appropriate styling

---

### Home Page

**Collection:** Home Page (file-based)

Controls all content on the homepage:

- **Hero Section:**
  - Hero image
  - Main text (location/availability)
  - Title (main headline)
  - Subtitle (supporting text)

- **Call to Actions (CTAs):**
  - Consultation CTA (text, alt text) - shown when Waitlist Only Mode is inactive, always links to /consultation
  - Waitlist CTA (text, alt text) - shown when Waitlist Only Mode is active, always links to /waitlist
  - Secondary CTA (text, link, alt text)
  - Deep CTA (lead text, button text, link, alt text)

- **Section Titles:**
  - How It Works section title
  - Services section title
  - Blog section title
  - Blog section subtitle
  - FAQs section title

- **How It Works Steps:**
  - Step 1 text
  - Step 2 text
  - Step 3 text

- **Eventbrite Link (optional):**
  - Description (optional text displayed above the button)
  - Link text (e.g., "View events on EventBrite")
  - Eventbrite URL
  - **Note:** Both link text AND URL must be set for the Eventbrite section to appear on the homepage. The section displays between "How it works" and "Services".

**File Location:** `src/content/{siteId}/home-page/content.yaml`

Example: `src/content/assessments/home-page/content.yaml`

**Note:** Homepage also displays:

- First 4 published FAQ items (from FAQs Page / FAQ Items)
- All published service items (from Services Page / Service Items) with automatically generated descriptive link text ("Learn more about [Service Title]")
- Testimonials section (from Testimonials) - only shown if testimonials exist
- Latest blog posts (from Blog Posts)
- Trust badges (from Site Settings / Trust Badges)

---

### FAQs Page

**Collection:** FAQs Page / Top Content (file-based)

Controls content at the top of the FAQ page:

- Title heading (H1)
- Sub-heading (optional, H3)
- Image (optional, centred)
- Content (optional, markdown support)

**File Location:** `src/content/{siteId}/faqs-page/top-content.yaml`

Example: `src/content/assessments/faqs-page/top-content.yaml`

---

**Collection:** FAQs Page / FAQ Items (folder-based)

Individual FAQ question-answer pairs:

- Question text (plain text)
- Answer text (markdown support - links, bold, italic, lists, etc.)
- Display order
- Published status

**File Location:** `src/content/{siteId}/faqs-page/faq-items/`

Example: `src/content/assessments/faqs-page/faq-items/`

**Markdown Support:** FAQ answers support full markdown formatting, allowing content editors to include:
- Links: `[link text](url)`
- Bold and italic text
- Lists (ordered and unordered)
- All standard markdown syntax

**Implementation:** Answer content is processed through `marked.parse()` before rendering on both the FAQ page (`src/pages/faq.astro:89`) and homepage (`src/pages/index.astro:264`), converting markdown to HTML with properly formatted links and styling.

**Note:** First 4 published FAQs also appear on the homepage.

---

### Services Page

**Collection:** Services Page / Top Content (file-based)

Controls content at the top of the Services page:

- Title heading (H1)
- Sub-heading (optional, H3)
- Image (optional, centred)
- Content (optional, markdown support)

**File Location:** `src/content/{siteId}/services-page/top-content.yaml`

Example: `src/content/assessments/services-page/top-content.yaml`

---

**Collection:** Services Page / Service Items (folder-based)

Individual service offerings:

- Service title
- Description
- Anchor ID (for deep linking)
- Display order
- Icon (from Tabler Icons - 5,993 icons available)
- Published status

**File Location:** `src/content/{siteId}/services-page/services/`

Example: `src/content/assessments/services-page/services/`

**Note:** Services also appear on the homepage in a preview section. The service card link text is automatically generated as "Learn more about [Service Title]" for better SEO and accessibility (programmatically generated in `src/pages/index.astro:162`).

---

### Consultation Page

**Collection:** Consultation Page (file-based)

Controls the consultation booking page:

- Title heading (H1)
- Sub-heading (optional, H3)
- Image (optional, centred)
- Content (optional, markdown support)
- Google Calendar booking link (embedded iframe)

**File Location:** `src/content/{siteId}/consultation-page/content.yaml`

Example: `src/content/assessments/consultation-page/content.yaml`

**Special Features:**

- Link to waitlist page displayed below the booking calendar
- Text: "No appointments available? Join the waitlist."
- When Waitlist Only Mode is active, visiting /consultation redirects to /waitlist

---

### Waitlist Page

**Collection:** Waitlist Page (file-based)

Controls the waitlist form page:

- Title heading (H1)
- Sub-heading (optional, H3)
- Image (optional, centred)
- Content (optional, markdown support)
- Google Form link (embedded iframe)

**File Location:** `src/content/{siteId}/waitlist-page/content.yaml`

Example: `src/content/assessments/waitlist-page/content.yaml`

**Special Features:**

- Similar structure to Consultation Page but uses Google Forms instead of Google Calendar
- Accessibility text: "open the waitlist form in a new tab"
- Page route: `/waitlist`
- **Dynamic navigation presence:**
  - When Waitlist Only Mode is inactive: Page accessible via link on Consultation Page, not in menus
  - When Waitlist Only Mode is active: Replaces all "Book a Consultation" links throughout navigation, header, and footer

---

### Contact Page

**Collection:** Contact Page (file-based)

Controls the contact page with email functionality:

- Title heading (H1)
- Sub-heading (optional, H3)
- Image (optional, centred)
- Content (optional, markdown support)

**File Location:** `src/content/{siteId}/contact-page/content.yaml`

Example: `src/content/assessments/contact-page/content.yaml`

**Special Features:**

- Displays an "Email Us" button that opens the user's email client
- Email address pulled from Site Settings (`site.email`)
- Email subject automatically set to: `{site-name} - Enquiry`
- Example: "Together Assessments - Enquiry"

---

### Text Pages

**Collection:** Text Pages (folder-based)

Simple markdown-based pages with consistent structure:

- Slug (hidden, auto-set from filename)
- Title heading (H1)
- Sub-heading (optional, H3)
- Image (optional, centred)
- Content (markdown support)

**File Locations:** `src/content/{siteId}/text-pages/`

Example: `src/content/assessments/text-pages/`

**Pre-created pages** (cannot be deleted, but can be edited):

- `about.md`
- `fees.md`
- `guides-and-toolkits.md`
- `local-support.md`
- `privacy-policy.md`
- `cookie-policy.md`
- `terms-of-service.md`
- `safeguarding.md`
- `accessibility-statement.md`
- `data-retention-sar.md`
- `policies-and-downloads.md`
- `refunds-cancellations.md`
- `complaints.md`
- `credits.md`

**Note:** New text pages cannot be created via CMS (create: false). To add new text pages, developers must create the file and corresponding route.

---

### Blog Posts

**Collection:** Blog Posts (folder-based)

Individual blog articles:

- Title
- Excerpt (50-160 characters, used in previews and SEO)
- Category (dropdown: Tutorials, News, Updates, Resources)
- Tags (1-5 tags)
- Featured image (optional, auto-optimised)
- Publish date (British format: DD/MM/YYYY)
- Author name
- Draft status (hide from production)
- Content (markdown with image and code-block support)
- SEO Metadata (optional):
  - Canonical URL
  - No-index flag

**File Location:** `src/content/{siteId}/blog-posts/`

Example: `src/content/assessments/blog-posts/`

**Categories Available:**

- Tutorials
- News
- Updates
- Resources

---

### Medical Conditions

**Collection:** Medical Conditions (folder-based)

Structured data for medical conditions used in Schema.org markup:

- Condition name
- Alternate names
- Description
- Signs and symptoms
- Affected anatomy
- Possible treatments (with type: MedicalTherapy, Drug, or LifestyleModification)
- Show on services toggle
- Published status

**File Location:** `src/content/{siteId}/medical-conditions/`

Example: `src/content/assessments/medical-conditions/`

**Note:** This collection provides structured medical condition data for semantic markup and is not directly displayed as standalone pages.

---

## Configuration Files

### Framework Configuration

**File:** `src/config.yaml`

Controls Astro/AstroWind framework behaviour:

- **Site Settings:**
  - Site URL (for deployment)
  - Base path
  - Trailing slash behaviour
  - Google Site Verification ID

- **Default SEO Metadata:**
  - Default title and template
  - Default description
  - Default robots settings (index/follow)
  - OpenGraph defaults (site_name, default image, type)
  - Twitter Card defaults (handle, site, card type)

- **Internationalisation:**
  - Language code
  - Text direction (ltr/rtl)

- **Blog Configuration:**
  - Enable/disable blog system
  - Posts per page (currently: 6)
  - Post URL permalink pattern
  - Blog main path (currently: 'blog')
  - Category path (currently: 'category')
  - Tag path (currently: 'tag')
  - Related posts count (currently: 4)
  - SEO settings per section

- **Analytics:**
  - Google Analytics 4 ID (configured in site-settings.yaml)
  - **Cookie Consent:** GDPR-compliant banner system
    - Only shows if GA4 ID is configured
    - Stores user choice in localStorage for 6 months
    - GA4 only loads if user accepts analytics
    - "Cookie Preferences" link in footer allows changing choice
    - See `src/components/common/CookieBanner.astro`
    - See `src/utils/consent.ts` for consent logic

- **UI Theme:**
  - Theme mode (system/light/dark/light:only/dark:only)

**Note:** This file OVERRIDES `astro.config.ts` for deployment settings.

---

### CMS Configuration

#### Multi-Site Configuration System

This project supports **three separate websites** from a single codebase:

- Together Assessments (assessments)
- Together ADHD (adhd)
- Together Autism (autism)

The CMS configuration is **generated at build time** based on which site is being built.

**Template File (SOURCE):**

- **File:** `public/admin/config.template.yml`
- **Purpose:** Single source of truth for ALL CMS configuration across all three sites
- **Important:** Edit THIS file to modify CMS configuration
- **Placeholders:**
  - `{{WEBSITE_ID}}` - Replaced with: assessments, adhd, or autism
  - `{{MEDIA_FOLDER}}` - Replaced with: `src/assets/images/{siteId}`
  - `{{PUBLIC_FOLDER}}` - Replaced with: `~/assets/images/{siteId}`
  - `{{SITE_URL}}` - Replaced with site-specific URL

**Generated Configuration File:**

- **File:** `public/admin/config.yml`
- **Purpose:** Auto-generated, site-specific CMS configuration
- **Important:** ⚠️ **DO NOT EDIT THIS FILE** - It's regenerated on every dev/build
- **Status:** Added to `.gitignore` (not version controlled)
- **Generated by:** `scripts/generate-cms-config.js`

**How Configuration Generation Works:**

1. Developer runs site-specific command (e.g., `npm run dev:assessments`)
2. Pre-hook calls `scripts/generate-cms-config.js` with `WEBSITE_ID` environment variable
3. Script reads `config.template.yml`
4. Script replaces placeholders with site-specific values
5. Script writes to `config.yml`
6. CMS loads the site-specific configuration

**Site-Specific Content Separation:**

- **Assessments:** `src/content/assessments/*`, `src/assets/images/assessments/`
- **ADHD:** `src/content/adhd/*`, `src/assets/images/adhd/`
- **Autism:** `src/content/autism/*`, `src/assets/images/autism/`

Each site's content is completely isolated - no cross-contamination between sites.

#### CMS Settings

Controls Decap CMS behaviour:

- GitHub repository connection
- Branch configuration
- Editorial workflow settings
- Media folder locations (site-specific)
- Collection definitions and schemas
- Custom widget configurations

**Key Settings (site-specific examples):**

For assessments site:

- Media folder: `src/assets/images/assessments/`
- Public folder reference: `~/assets/images/assessments/`
- Content location: `src/content/assessments/`
- Site URL for previews: (set via environment variables)
- Commit message templates (include site ID)

For adhd/autism sites: Similar structure with their respective site IDs.

---

### Custom Styles

**File:** `src/components/CustomStyles.astro`

Contains global style definitions:

- CSS custom properties (CSS variables)
- Font definitions and preloading
- Colour theming (primary, secondary, accent)
- Dark mode styles
- Neurodiversity-friendly font configurations

**Fonts Defined:**

- Sylexiad Sans Medium (default body/serif)
- OpenDyslexic3 (dyslexia-friendly)
- Fast Sans (fast-reading alternative)
- Together Assessments (brand heading font)

---

## Navigation

Navigation is configured in `src/navigation.ts` with responsive breakpoint support and dynamic booking links.

### Dynamic Booking Links

The navigation system responds to the **Waitlist Only Mode** toggle in Site Settings:

- **When `waitlist_only: false` (default):**
  - All booking links say "Book a Consultation" and link to `/consultation`

- **When `waitlist_only: true`:**
  - All booking links say "Join the Waitlist" and link to `/waitlist`

This affects:

- Header button (desktop xl+ and tablet/mobile)
- Tablet menu "Assessments" dropdown
- Footer "Pages" section

**Implementation:** `src/navigation.ts` lines 53-55 create `bookingLink` and `bookingText` variables based on `settings.site.waitlist_only` flag.

### Desktop Navigation

Displayed at `xl:` breakpoint and above (1280px+):

- About
- Services
- Fees
- FAQs
- Resources (dropdown):
  - Contact
  - Self-Help
  - Local Support
  - Blog
- Together (dropdown):
  - Together ADHD (external link)
  - Together Autism (external link)
- **Dynamic booking button** in header (text and link respond to Waitlist Only Mode)

### Tablet Navigation

Displayed between `md:` and `xl:` breakpoints (768px-1279px):

- Assessments (dropdown):
  - About
  - Services
  - Fees
  - FAQs
  - **Dynamic booking link** (responds to Waitlist Only Mode)
- Resources (dropdown):
  - Contact
  - Self-Help
  - Local Support
  - Blog
- Together (dropdown):
  - Together ADHD (external link)
  - Together Autism (external link)

### Footer Navigation

Three columns of links:

**Pages:**

- Home, **Dynamic booking link** (responds to Waitlist Only Mode), About, Services, Fees, FAQs, Blog, Self-Help, Local Support, Contact

**Website Policies:**

- Privacy Policy, Cookie Policy, Terms of Service

**Support & Standards:**

- Safeguarding, Accessibility Statement, Data Retention & SAR, Policies and Downloads, Credits, Refunds/Cancellations, Complaints

**Footer Note:**

- Copyright with dynamic year
- ICO Registration (from `site-settings.yaml`)
- Business information (from `site-settings.yaml`)
- Email address (from `site-settings.yaml`)

---

## Accessibility Features

**Note:** For complete accessibility documentation including WCAG compliance and testing procedures, see [ACCESSIBILITY.md](./ACCESSIBILITY.md).

### Neurodiversity-Friendly Fonts

The site implements a custom font switcher allowing users to select their preferred reading font:

**Available Fonts:**

1. **Sylexiad Sans Medium** (default) - General neurodiversity-friendly design
2. **OpenDyslexic3** - Specifically designed for dyslexic readers
3. **Fast Sans** - Optimised for quick reading and reduced eye strain
4. **Together Assessments** - Brand font used for headings only

**Implementation:**

- Font switcher dropdown in header
- User preference saved to localStorage
- Fonts preloaded for performance
- Consistent metrics across all fonts (size-adjust)

**Technical Details:**

- Font definitions: `src/components/CustomStyles.astro`
- Font switcher: `src/components/common/ToggleFont.astro`
- Font files: `public/fonts/`

### Site Search

**Implementation:** Pagefind static site search with custom UI

The site includes a comprehensive search feature allowing users to quickly find content across all pages:

**Features:**

- Lazy-loaded search index (only loads when search is opened)
- Debounced search input (300ms) for optimal performance
- Results show page title, excerpt with highlighted search terms, and URL
- Limited to 15 results for performance
- Search index isolated per site (assessments search only searches assessments content)

**Accessibility:**

- Full keyboard navigation (Escape to close, Tab through results, Enter to open)
- Focus trap while panel is open
- Focus restoration when panel closes
- Screen reader announcements for result counts
- ARIA roles and labels throughout
- Theme integration (respects dark/light mode)

**Responsive Design:**

- Desktop: Panel slides in from right (480px wide)
- Mobile: Panel slides up from bottom (full width, 80vh max height)

**Technical Notes:**

- Search index generated during build process
- Dev mode serves prebuilt index (run build once initially)
- Uses event delegation for Astro view transitions compatibility

**Components:**

- `ToggleSearch.astro` - Search button in header
- `SearchPanel.astro` - Full search modal panel

### Other Accessibility Features

- **Text-to-Speech system** - Read page content aloud with British English voice selection
- **Text size adjustment** - Five size options (XS to XL)
- **Line height control** - Compact, normal, or relaxed spacing
- **Reading ruler** - Draggable line guide for tracking text
- Dark mode toggle (system/light/dark)
- Responsive design with mobile-first approach
- Semantic HTML structure
- Optional alt text fields for all CMS images with sensible fallbacks
- ARIA labels and accessibility attributes
- Keyboard navigation support
- Colour contrast compliance

---

## Sister Sites

The website is part of a network:

- Together ADHD: https://togetheradhd.co.uk
- Together Autism: https://togetherautism.co.uk

These are linked in the navigation under the "Together" dropdown menu.

---

## Additional Notes

### Content Philosophy

This documentation describes the **structure** of the website (what CAN be configured), not the **content** (what IS currently configured). This separation allows:

- Understanding where to make changes without needing to know current values
- Maintaining consistency as content evolves
- Clear documentation for new team members or future reference

### Image Management

- All images uploaded via CMS are stored in site-specific folders:
  - Assessments: `src/assets/images/assessments/`
  - ADHD: `src/assets/images/adhd/`
  - Autism: `src/assets/images/autism/`
- Images are automatically optimised during build (multiple sizes, WebP conversion)
- Editorial Workflow prevents orphaned images (images only committed when content is published)
- Maximum file sizes enforced by CMS for different image types
- Each site's images are completely separate (no cross-contamination)

### Editorial Workflow

The CMS uses Editorial Workflow with three stages:

1. **Draft** - Initial content creation
2. **In Review** - Creates Pull Request for review
3. **Ready** - Approved and ready to publish
4. **Published** - Merged to main branch, triggers build

This prevents race conditions and ensures quality control before content goes live.

---

**Last Updated:** 2025-12-07
