import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { HTMLAttributes, ImageMetadata } from 'astro/types';
import type { TTSPlayer } from './scripts/tts-player';

export interface Post {
  /** A unique ID number that identifies a post. */
  id: string;

  /** A post’s unique slug – part of the post’s URL based on its name, i.e. a post called “My Sample Page” has a slug “my-sample-page”. */
  slug: string;

  /**  */
  permalink: string;

  /**  */
  publishDate: Date;
  /**  */
  updateDate?: Date;

  /**  */
  title: string;
  /** Optional summary of post content. */
  excerpt?: string;
  /**  */
  image?: ImageMetadata | string;
  /** Optional alt text for the featured image. */
  image_alt?: string;

  /**  */
  category?: Taxonomy;
  /**  */
  tags?: Taxonomy[];
  /**  */
  author?:
    | string
    | {
        name: string;
        jobTitle?: string;
        credentials?: string[];
        bio?: string;
        photo?: string;
      };

  /**  */
  metadata?: MetaData;

  /**  */
  draft?: boolean;

  /**  */
  Content?: AstroComponentFactory;
  content?: string;
  body?: string;

  /**  */
  readingTime?: number;

  /** SEO settings for the post */
  seo_settings?: {
    metaTitle?: string;
    metaDescription?: string;
  };

  /** Content review tracking */
  content_review?: {
    lastReviewed?: Date;
  };
}

export interface Taxonomy {
  slug: string;
  title: string;
}

export interface MetaData {
  title?: string;
  ignoreTitleTemplate?: boolean;

  canonical?: string;

  robots?: MetaDataRobots;

  description?: string;

  openGraph?: MetaDataOpenGraph;
  twitter?: MetaDataTwitter;
  facebook?: {
    appId?: string;
  };
  mobileAlternate?: {
    media: string;
    href: string;
  };
  languageAlternates?: Array<{
    hreflang: string;
    href: string;
  }>;
  additionalMetaTags?: Array<{
    name?: string;
    property?: string;
    httpEquiv?: string;
    content: string;
  }>;
  additionalLinkTags?: Array<{
    rel: string;
    href: string;
    sizes?: string;
    media?: string;
    type?: string;
    color?: string;
    as?: string;
    crossOrigin?: string;
  }>;
}

export interface MetaDataRobots {
  index?: boolean;
  follow?: boolean;
  nosnippet?: boolean;
  maxSnippet?: number;
  maxImagePreview?: string;
  noarchive?: boolean;
  unavailableAfter?: string;
  noimageindex?: boolean;
  notranslate?: boolean;
}

export interface MetaDataImage {
  url: string;
  width?: number;
  height?: number;
}

export interface MetaDataOpenGraph {
  url?: string;
  siteName?: string;
  images?: Array<MetaDataImage>;
  locale?: string;
  type?: string;
}

export interface MetaDataTwitter {
  handle?: string;
  site?: string;
  cardType?: string;
}

export interface OpenGraph {
  images?: Array<{
    url?: string;
    width?: number;
    height?: number;
    alt?: string;
    secureUrl?: string;
    type?: string;
  }>;
}

export interface ProcessedOpenGraph {
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  site_name?: string;
  locale?: string;
  images?: Array<{
    url: string;
    alt?: string;
    secureUrl?: string;
    type?: string;
    width?: number;
    height?: number;
  }>;
  videos?: Array<{
    url: string;
    alt?: string;
    secureUrl?: string;
    type?: string;
    width?: number;
    height?: number;
  }>;
  profile?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    gender?: string;
  };
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    expirationTime?: string;
    authors?: string[];
    section?: string;
    tags?: string[];
  };
  book?: {
    authors?: string[];
    isbn?: string;
    releaseDate?: string;
    tags?: string[];
  };
  video?: {
    actors?: Array<{
      profile: string;
      role?: string;
    }>;
    directors?: string[];
    writers?: string[];
    duration?: number;
    releaseDate?: string;
    tags?: string[];
    series?: string;
  };
}

export interface Image {
  src: string;
  alt?: string;
}

export interface Video {
  src: string;
  type?: string;
}

export interface Widget {
  id?: string;
  isDark?: boolean;
  bg?: string;
  classes?: Record<string, string | Record<string, string>>;
}

export interface Headline {
  title?: string;
  subtitle?: string;
  tagline?: string;
  classes?: Record<string, string>;
}

interface TeamMember {
  name?: string;
  job?: string;
  image?: Image;
  socials?: Array<Social>;
  description?: string;
  classes?: Record<string, string>;
}

interface Social {
  icon?: string;
  href?: string;
}

export interface Stat {
  amount?: number | string;
  title?: string;
  icon?: string;
}

export interface Item {
  title?: string;
  description?: string;
  icon?: string;
  classes?: Record<string, string>;
  callToAction?: CallToAction;
  image?: Image;
}

export interface Price {
  title?: string;
  subtitle?: string;
  description?: string;
  price?: number | string;
  period?: string;
  items?: Array<Item>;
  callToAction?: CallToAction;
  hasRibbon?: boolean;
  ribbonTitle?: string;
}

export interface Testimonial {
  title?: string;
  testimonial?: string;
  name?: string;
  job?: string;
  image?: string | unknown;
}

export interface Input {
  type: HTMLInputTypeAttribute;
  name: string;
  label?: string;
  autocomplete?: string;
  placeholder?: string;
}

export interface Textarea {
  label?: string;
  name?: string;
  placeholder?: string;
  rows?: number;
}

export interface Disclaimer {
  label?: string;
}

// COMPONENTS
export interface CallToAction extends Omit<HTMLAttributes<'a'>, 'slot'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link';
  text?: string;
  icon?: string;
  classes?: Record<string, string>;
  type?: 'button' | 'submit' | 'reset';
}

export interface ItemGrid {
  items?: Array<Item>;
  columns?: number;
  defaultIcon?: string;
  classes?: Record<string, string>;
}

export interface Collapse {
  iconUp?: string;
  iconDown?: string;
  items?: Array<Item>;
  columns?: number;
  classes?: Record<string, string>;
}

export interface Form {
  inputs?: Array<Input>;
  textarea?: Textarea;
  disclaimer?: Disclaimer;
  button?: string;
  description?: string;
}

// WIDGETS
export interface Hero extends Omit<Headline, 'classes'>, Omit<Widget, 'isDark' | 'classes'> {
  content?: string;
  actions?: string | CallToAction[];
  image?: string | unknown;
  noSpacer?: boolean;
}

export interface Team extends Omit<Headline, 'classes'>, Widget {
  team?: Array<TeamMember>;
}

export interface Stats extends Omit<Headline, 'classes'>, Widget {
  stats?: Array<Stat>;
}

export interface Pricing extends Omit<Headline, 'classes'>, Widget {
  prices?: Array<Price>;
}

export interface Testimonials extends Omit<Headline, 'classes'>, Widget {
  testimonials?: Array<Testimonial>;
  callToAction?: CallToAction;
}

export interface Brands extends Omit<Headline, 'classes'>, Widget {
  icons?: Array<string>;
  images?: Array<Image>;
}

export interface Features extends Omit<Headline, 'classes'>, Widget {
  image?: string | unknown;
  video?: Video;
  items?: Array<Item>;
  columns?: number;
  defaultIcon?: string;
  callToAction1?: CallToAction;
  callToAction2?: CallToAction;
  isReversed?: boolean;
  isBeforeContent?: boolean;
  isAfterContent?: boolean;
}

export interface Faqs extends Omit<Headline, 'classes'>, Widget {
  iconUp?: string;
  iconDown?: string;
  items?: Array<Item>;
  columns?: number;
}

export interface Steps extends Omit<Headline, 'classes'>, Widget {
  items?: Array<Item>;
  callToAction?: string | CallToAction;
  image?: string | Image;
  isReversed?: boolean;
}

export interface Content extends Omit<Headline, 'classes'>, Widget {
  content?: string;
  image?: string | unknown;
  items?: Array<Item>;
  columns?: number;
  isReversed?: boolean;
  isAfterContent?: boolean;
  callToAction?: CallToAction;
}

export interface Contact extends Omit<Headline, 'classes'>, Form, Widget {}

// Global window extensions for accessibility features
declare global {
  interface Window {
    ttsPlayer?: TTSPlayer;
    closeAccessibilityPanel?: () => void;
    closeMobileMenu?: () => void;
    initializeTTSIfNeeded?: () => Promise<void>;
    initializeAccessibilityPanelInteractions?: () => Promise<void>;
    accessibilityPanelUtils: {
      getSettings: () => {
        font: string;
        theme: string;
        textSize: string;
        lineHeight: string;
        readingRuler: boolean;
      };
      saveSettings: (settings: {
        font: string;
        theme: string;
        textSize: string;
        lineHeight: string;
        readingRuler: boolean;
      }) => void;
      resetSettings: () => {
        font: string;
        theme: string;
        textSize: string;
        lineHeight: string;
        readingRuler: boolean;
      };
      applySettings: (settings: {
        font: string;
        theme: string;
        textSize: string;
        lineHeight: string;
        readingRuler: boolean;
      }) => void;
      applyFont: (font: string) => void;
      applyTheme: (theme: string) => void;
      applyTextSize: (size: string) => void;
      applyLineHeight: (lineHeight: string) => void;
      applyReadingRuler: (enabled: boolean) => void;
      loadAccessibilityFonts: () => Promise<void>;
      applyFontPreviews: () => void;
      resetFontLoadingState: () => void;
      removeDragHandlers: () => void;
      removeReadingRuler: () => void;
      updateReadingRulerState: (enabled: boolean) => void;
    };
  }
}
