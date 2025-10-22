// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="vite/client" />
/// <reference types="../vendor/integration/types.d.ts" />

interface ImportMetaEnv {
  readonly WEBSITE_ID: 'assessments' | 'adhd' | 'autism';
  readonly ASSESSMENTS_URL: string;
  readonly ADHD_URL: string;
  readonly AUTISM_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  closeMobileMenu?: () => void;
}
