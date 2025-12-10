import { getPermalink, getBlogPermalink } from './utils/permalinks';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';

// Get WEBSITE_ID from environment
const WEBSITE_ID = process.env.WEBSITE_ID;
if (!WEBSITE_ID) {
  throw new Error('WEBSITE_ID environment variable is required');
}

// Load site settings using direct YAML reading
const settingsPath = path.join(process.cwd(), `src/content/${WEBSITE_ID}/site-settings.yaml`);
const settings = YAML.parse(fs.readFileSync(settingsPath, 'utf8'));

// Get site URLs from environment
const getSiteUrls = () => {
  const urls = {
    assessments: process.env.ASSESSMENTS_URL,
    adhd: process.env.ADHD_URL,
    autism: process.env.AUTISM_URL,
  };

  if (!urls.assessments || !urls.adhd || !urls.autism) {
    throw new Error('All site URLs must be set: ASSESSMENTS_URL, ADHD_URL, AUTISM_URL');
  }

  return urls;
};

// Get site config
const SITE_CONFIG = {
  assessments: { name: 'Together Assessments' },
  adhd: { name: 'Together ADHD' },
  autism: { name: 'Together Autism' },
};

// Get OTHER sites (for cross-site links in menu)
const getOtherSites = () => {
  const urls = getSiteUrls();
  const allSites = [
    { id: 'assessments', name: SITE_CONFIG.assessments.name, url: urls.assessments },
    { id: 'adhd', name: SITE_CONFIG.adhd.name, url: urls.adhd },
    { id: 'autism', name: SITE_CONFIG.autism.name, url: urls.autism },
  ];

  // Return all sites EXCEPT current one
  return allSites.filter((site) => site.id !== WEBSITE_ID);
};

const otherSites = getOtherSites();

// Dynamic booking link based on waitlist_only flag
const bookingLink = settings.site.waitlist_only ? getPermalink('/waitlist') : getPermalink('/consultation');
const bookingText = settings.site.waitlist_only ? 'Join the Waitlist' : 'Book a Consultation';

// Desktop menu links
const desktopLinks = [
  { text: 'About', href: getPermalink('/about') },
  { text: 'Services', href: getPermalink('/services') },
  { text: 'Fees', href: getPermalink('/fees') },
  { text: 'FAQs', href: getPermalink('/faq') },
  {
    text: 'Resources',
    links: [
      { text: 'Contact', href: getPermalink('/contact') },
      { text: 'Guides & Toolkits', href: getPermalink('/guides-and-toolkits') },
      { text: 'Local Support', href: getPermalink('/local-support') },
      { text: 'Blog', href: getBlogPermalink() },
    ],
  },
  {
    text: 'Together',
    links: otherSites.map((site) => ({
      text: site.name,
      href: site.url,
      target: '_blank',
      rel: 'noopener noreferrer',
    })),
  },
];

// Tablet menu links
const tabletLinks = [
  {
    text: 'Assessments',
    links: [
      { text: 'About', href: getPermalink('/about') },
      { text: 'Services', href: getPermalink('/services') },
      { text: 'Fees', href: getPermalink('/fees') },
      { text: 'FAQs', href: getPermalink('/faq') },
      { text: bookingText, href: bookingLink },
    ],
  },
  {
    text: 'Resources',
    links: [
      { text: 'Contact', href: getPermalink('/contact') },
      { text: 'Guides & Toolkits', href: getPermalink('/guides-and-toolkits') },
      { text: 'Local Support', href: getPermalink('/local-support') },
      { text: 'Blog', href: getBlogPermalink() },
    ],
  },
  {
    text: 'Together',
    links: otherSites.map((site) => ({
      text: site.name,
      href: site.url,
      target: '_blank',
      rel: 'noopener noreferrer',
    })),
  },
];

export const headerData = {
  links: desktopLinks,
  tabletLinks: tabletLinks,
  actions: [{ text: bookingText, href: bookingLink }],
};

export const footerData = {
  links: [
    {
      title: 'Pages',
      links: [
        { text: 'Home', href: getPermalink('/') },
        { text: bookingText, href: bookingLink },
        { text: 'About', href: getPermalink('/about') },
        { text: 'Services', href: getPermalink('/services') },
        { text: 'Fees', href: getPermalink('/fees') },
        { text: 'FAQs', href: getPermalink('/faq') },
        { text: 'Blog', href: getBlogPermalink() },
        { text: 'Guides & Toolkits', href: getPermalink('/guides-and-toolkits') },
        { text: 'Local Support', href: getPermalink('/local-support') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
    {
      title: 'Website Policies',
      links: [
        { text: 'Privacy Policy', href: getPermalink('/privacy-policy') },
        { text: 'Cookie Policy', href: getPermalink('/cookie-policy') },
        { text: 'Terms of Service', href: getPermalink('/terms-of-service') },
      ],
    },
    {
      title: 'Support & Standards',
      links: [
        { text: 'Safeguarding', href: getPermalink('/safeguarding') },
        { text: 'Accessibility Statement', href: getPermalink('/accessibility-statement') },
        { text: 'Data Retention & SAR', href: getPermalink('/data-retention-sar') },
        { text: 'Policies and Downloads', href: getPermalink('/policies-and-downloads') },
        { text: 'Credits', href: getPermalink('/credits') },
        { text: 'Refunds/Cancellations', href: getPermalink('/refunds-cancellations') },
        { text: 'Complaints', href: getPermalink('/complaints') },
      ],
    },
  ],
  secondaryLinks: [{ text: 'Cookie Preferences', href: '#cookie-preferences' }],
  socialLinks: [], // No social links per client request
  footNote: `
    <div class="text-sm">
      <p>Copyright © ${settings.site.name} ${new Date().getFullYear()}. ICO Registration: ${settings.site.ico_registration}</p>
      <p class="mt-2">Sole trader, trading as ${settings.site.name}. North Lincolnshire and surrounding areas, <a href="mailto:${settings.site.email}" class="text-primary underline hover:no-underline dark:text-primary dark:underline dark:hover:no-underline">${settings.site.email}</a></p>
    </div>
  `,
};
