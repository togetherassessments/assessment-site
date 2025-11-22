import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';
import pagefind from 'astro-pagefind';
import type { AstroIntegration } from 'astro';

import astrowind from './vendor/integration';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = false;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

// ============================================================================
// Site URL Configuration
// ============================================================================
// The site URL must be set here (not via updateConfig in an integration) to
// ensure Astro.url is constructed correctly during static builds.
// See: https://github.com/withastro/astro/issues/13888

const WEBSITE_ID = process.env.WEBSITE_ID;
if (!WEBSITE_ID) {
  throw new Error('❌ WEBSITE_ID environment variable is required');
}

const validWebsiteIds = ['assessments', 'adhd', 'autism'] as const;
type WebsiteId = (typeof validWebsiteIds)[number];

if (!validWebsiteIds.includes(WEBSITE_ID as WebsiteId)) {
  throw new Error(`❌ Invalid WEBSITE_ID: ${WEBSITE_ID}. Must be one of: ${validWebsiteIds.join(', ')}`);
}

const siteUrlMap: Record<WebsiteId, string | undefined> = {
  assessments: process.env.ASSESSMENTS_URL,
  adhd: process.env.ADHD_URL,
  autism: process.env.AUTISM_URL,
};

const siteUrl = siteUrlMap[WEBSITE_ID as WebsiteId];
if (!siteUrl) {
  throw new Error(`❌ ${WEBSITE_ID.toUpperCase()}_URL environment variable is required but not set`);
}

export default defineConfig({
  site: siteUrl,
  output: 'static',

  build: {
    inlineStylesheets: 'auto',
  },

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    mdx(),
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
      },
    }),

    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ['dataLayer.push'] },
      })
    ),

    compress({
      CSS: true,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
        },
      },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),

    astrowind({
      config: './src/config.yaml',
    }),

    // Pagefind MUST be last - it needs to index the final HTML output
    pagefind(),
  ],

  image: {
    domains: ['cdn.pixabay.com'],
  },

  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
    rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
  },

  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
    build: {
      assetsInlineLimit: 4096, // Inline assets smaller than 4KB
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
    server: {
      fs: {
        allow: ['.', './dist'],
      },
    },
    optimizeDeps: {
      exclude: ['/pagefind/pagefind.js'],
    },
  },
});
