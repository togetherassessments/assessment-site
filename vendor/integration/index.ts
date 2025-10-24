import fs from 'node:fs';
import os from 'node:os';
import type { AstroConfig, AstroIntegration } from 'astro';

import configBuilder, { type Config } from './utils/configBuilder';
import loadConfig from './utils/loadConfig';

export default ({ config: _themeConfig = 'src/config.yaml' } = {}): AstroIntegration => {
  let cfg: AstroConfig;
  return {
    name: 'astrowind-integration',

    hooks: {
      'astro:config:setup': async ({
        // command,
        config,
        // injectRoute,
        // isRestart,
        logger,
        updateConfig,
        addWatchFile,
      }) => {
        const buildLogger = logger.fork('astrowind');

        const virtualModuleId = 'astrowind:config';
        const resolvedVirtualModuleId = '\0' + virtualModuleId;

        const rawJsonConfig = (await loadConfig(_themeConfig)) as Config;
        const { SITE, I18N, METADATA, APP_BLOG, UI, ANALYTICS } = configBuilder(rawJsonConfig);

        // Override site URL with environment-specific URL for multi-site architecture
        const WEBSITE_ID = process.env.WEBSITE_ID;
        if (!WEBSITE_ID) {
          throw new Error('❌ WEBSITE_ID environment variable is required');
        }

        const validIds = ['assessments', 'adhd', 'autism'] as const;
        if (!validIds.includes(WEBSITE_ID as any)) {
          throw new Error(`❌ Invalid WEBSITE_ID: ${WEBSITE_ID}. Must be one of: ${validIds.join(', ')}`);
        }

        const siteUrlMap = {
          assessments: process.env.ASSESSMENTS_URL,
          adhd: process.env.ADHD_URL,
          autism: process.env.AUTISM_URL,
        };

        const siteUrl = siteUrlMap[WEBSITE_ID as keyof typeof siteUrlMap];
        if (!siteUrl) {
          throw new Error(
            `❌ ${WEBSITE_ID.toUpperCase()}_URL environment variable is required but not set`
          );
        }

        SITE.site = siteUrl;
        buildLogger.info(`Multi-site: ${WEBSITE_ID} → ${siteUrl}`);

        updateConfig({
          site: SITE.site,
          base: SITE.base,

          trailingSlash: SITE.trailingSlash ? 'always' : 'never',

          vite: {
            plugins: [
              {
                name: 'vite-plugin-astrowind-config',
                resolveId(id) {
                  if (id === virtualModuleId) {
                    return resolvedVirtualModuleId;
                  }
                },
                load(id) {
                  if (id === resolvedVirtualModuleId) {
                    return `
                    export const SITE = ${JSON.stringify(SITE)};
                    export const I18N = ${JSON.stringify(I18N)};
                    export const METADATA = ${JSON.stringify(METADATA)};
                    export const APP_BLOG = ${JSON.stringify(APP_BLOG)};
                    export const UI = ${JSON.stringify(UI)};
                    export const ANALYTICS = ${JSON.stringify(ANALYTICS)};
                    `;
                  }
                },
              },
            ],
          },
        });

        if (typeof _themeConfig === 'string') {
          addWatchFile(new URL(_themeConfig, config.root));

          buildLogger.info(`Astrowind \`${_themeConfig}\` has been loaded.`);
        } else {
          buildLogger.info(`Astrowind config has been loaded.`);
        }
      },
      'astro:config:done': async ({ config }) => {
        cfg = config;
      },

      'astro:build:done': async ({ logger }) => {
        const buildLogger = logger.fork('astrowind');
        buildLogger.info('Updating `robots.txt` with `sitemap-index.xml` ...');

        try {
          const outDir = cfg.outDir;
          const publicDir = cfg.publicDir;
          const sitemapName = 'sitemap-index.xml';
          const sitemapFile = new URL(sitemapName, outDir);
          const robotsTxtFile = new URL('robots.txt', publicDir);
          const robotsTxtFileInOut = new URL('robots.txt', outDir);

          const hasIntegration =
            Array.isArray(cfg?.integrations) &&
            cfg.integrations?.find((e) => e?.name === '@astrojs/sitemap') !== undefined;
          const sitemapExists = fs.existsSync(sitemapFile);

          if (hasIntegration && sitemapExists) {
            const robotsTxt = fs.readFileSync(robotsTxtFile, { encoding: 'utf8', flag: 'a+' });
            const sitemapUrl = new URL(sitemapName, String(new URL(cfg.base, cfg.site)));
            const pattern = /^Sitemap:(.*)$/m;

            if (!pattern.test(robotsTxt)) {
              fs.writeFileSync(robotsTxtFileInOut, `${robotsTxt}${os.EOL}${os.EOL}Sitemap: ${sitemapUrl}`, {
                encoding: 'utf8',
                flag: 'w',
              });
            } else {
              fs.writeFileSync(robotsTxtFileInOut, robotsTxt.replace(pattern, `Sitemap: ${sitemapUrl}`), {
                encoding: 'utf8',
                flag: 'w',
              });
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          /* empty */
        }
      },
    },
  };
};
