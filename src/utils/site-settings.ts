import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

export interface SiteSettings {
  site: {
    name: string;
    email: string;
    ico_registration: string;
    waitlist_only: boolean;
  };
  seo: {
    title_default?: string;
    title_template?: string;
    description?: string;
    og_image?: string;
    google_verification_id?: string;
    robots_index?: boolean;
    robots_follow?: boolean;
    area_served?: string;
    social?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
    };
    business?: {
      founding_date?: string;
      legal_name?: string;
      vat_id?: string;
    };
  };
  branding?: {
    mask_icon_colour?: string;
  };
  analytics?: {
    ga4_id?: string;
  };
  logo: {
    light: string;
    dark: string;
    alt: string;
  };
  footer: {
    title: string;
    business_info: string;
  };
}

let cachedSettings: SiteSettings | null = null;

export function getSiteSettings(): SiteSettings {
  if (cachedSettings) return cachedSettings;

  const WEBSITE_ID = import.meta.env.WEBSITE_ID || process.env.WEBSITE_ID;

  if (!WEBSITE_ID) {
    throw new Error('❌ WEBSITE_ID environment variable is required');
  }

  const settingsPath = path.join(process.cwd(), `src/content/${WEBSITE_ID}/site-settings.yaml`);

  if (!fs.existsSync(settingsPath)) {
    throw new Error(`❌ Site settings not found: ${settingsPath}`);
  }

  cachedSettings = yaml.load(fs.readFileSync(settingsPath, 'utf8')) as SiteSettings;

  return cachedSettings;
}
