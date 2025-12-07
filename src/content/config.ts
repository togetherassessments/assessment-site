import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

// Get WEBSITE_ID - build fails if not set
const WEBSITE_ID = process.env.WEBSITE_ID;
if (!WEBSITE_ID) {
  throw new Error('WEBSITE_ID environment variable is required');
}

// Metadata schema (reused)
const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),
      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),
      description: z.string().optional(),
      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),
      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

// SEO settings schema (reused across collections)
const seoSettingsDefinition = () =>
  z
    .object({
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().min(120).max(160).optional(),
      ogImage: z.string().optional(),
    })
    .optional();

// Blog posts (site-specific)
const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: `src/content/${WEBSITE_ID}/blog-posts` }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),
    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    // Enhanced author field - supports legacy string or new object format
    author: z
      .union([
        z.string(), // Legacy support
        z.object({
          name: z.string(),
          jobTitle: z.string().optional(),
          credentials: z.array(z.string()).optional(),
          bio: z.string().optional(),
          photo: z.string().optional(),
        }),
      ])
      .optional(),
    // SEO settings
    seo_settings: z
      .object({
        metaTitle: z.string().max(60).optional(),
        metaDescription: z.string().min(120).max(160).optional(),
      })
      .optional(),
    // Content review tracking
    content_review: z
      .object({
        lastReviewed: z.date().optional(),
      })
      .optional(),
    // Optional condition reference
    related_condition: z.string().optional(),
    metadata: metadataDefinition(),
  }),
});

// FAQ items (site-specific)
const faqCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: `src/content/${WEBSITE_ID}/faqs-page/faq-items` }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    icon: z.string().optional(),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    order: z.number().default(1),
    published: z.boolean().default(true),
  }),
});

// Service items (site-specific)
const serviceCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: `src/content/${WEBSITE_ID}/services-page/services` }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    long_description: z.string().optional(),
    anchor: z.string(),
    order: z.number().default(1),
    icon: z.string().optional(),
    image: z.string().optional(),
    published: z.boolean().default(true),
    // Schema.org Service data
    schema_data: z
      .object({
        priceRange: z.string().optional(),
        duration: z.string().optional(),
        serviceType: z.string().optional(),
      })
      .optional(),
  }),
});

// Trust badges (site-specific)
const trustBadgeCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: `src/content/${WEBSITE_ID}/site-settings/trust-badges` }),
  schema: z.object({
    name: z.string(),
    display_text: z.string(),
    logo_light: z.string(),
    logo_dark: z.string(),
    alt: z.string(),
    order: z.number().default(1),
    published: z.boolean().default(true),
  }),
});

// Text pages (site-specific)
const textPageCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: `src/content/${WEBSITE_ID}/text-pages` }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    subheading: z.string().optional(),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    // SEO settings
    seo_settings: z
      .object({
        metaTitle: z.string().max(60).optional(),
        metaDescription: z.string().min(120).max(160).optional(),
        ogImage: z.string().optional(),
      })
      .optional(),
  }),
});

// Services page top content (site-specific)
const servicesPageTopContentCollection = defineCollection({
  loader: glob({ pattern: 'top-content.yaml', base: `src/content/${WEBSITE_ID}/services-page` }),
  schema: z.object({
    title: z.string(),
    subheading: z.string().optional(),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    body: z.string().optional(),
    // SEO settings
    seo_settings: seoSettingsDefinition(),
    // Catalogue information
    catalogue_info: z
      .object({
        name: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
  }),
});

// FAQs page top content (site-specific)
const faqsPageTopContentCollection = defineCollection({
  loader: glob({ pattern: 'top-content.yaml', base: `src/content/${WEBSITE_ID}/faqs-page` }),
  schema: z.object({
    title: z.string(),
    subheading: z.string().optional(),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    body: z.string().optional(),
    // SEO settings
    seo_settings: seoSettingsDefinition(),
  }),
});

// Consultation page (site-specific)
const consultationPageCollection = defineCollection({
  loader: glob({ pattern: 'content.yaml', base: `src/content/${WEBSITE_ID}/consultation-page` }),
  schema: z.object({
    title: z.string(),
    subheading: z.string().optional(),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    body: z.string().optional(),
    google_calendar_link: z.string().url(),
    // SEO settings
    seo_settings: seoSettingsDefinition(),
  }),
});

// Contact page (site-specific)
const contactPageCollection = defineCollection({
  loader: glob({ pattern: 'content.yaml', base: `src/content/${WEBSITE_ID}/contact-page` }),
  schema: z.object({
    title: z.string(),
    subheading: z.string().optional(),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    body: z.string().optional(),
    // SEO settings
    seo_settings: seoSettingsDefinition(),
  }),
});

// Waitlist page (site-specific)
const waitlistPageCollection = defineCollection({
  loader: glob({ pattern: 'content.yaml', base: `src/content/${WEBSITE_ID}/waitlist-page` }),
  schema: z.object({
    title: z.string(),
    subheading: z.string().optional(),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    body: z.string().optional(),
    google_form_link: z.string().url(),
    // SEO settings
    seo_settings: seoSettingsDefinition(),
  }),
});

// Home page content (site-specific)
const homePageCollection = defineCollection({
  loader: glob({ pattern: 'content.yaml', base: `src/content/${WEBSITE_ID}/home-page` }),
  schema: z.object({
    // Hero section
    hero: z.object({
      image: z.string(),
      text: z.string(),
      title: z.string(),
      subtitle: z.string(),
      image_alt: z.string(),
    }),
    // CTAs
    ctas: z.object({
      consultation: z.object({
        text: z.string(),
        alt: z.string(),
      }),
      waitlist: z.object({
        text: z.string(),
        alt: z.string(),
      }),
      secondary: z.object({
        text: z.string(),
        link: z.string(),
        alt: z.string(),
      }),
      deep: z.object({
        lead_text: z.string(),
        text: z.string(),
        link: z.string(),
        alt: z.string(),
      }),
    }),
    // Section titles
    sections: z.object({
      how_it_works: z.string(),
      services: z.string(),
      blog: z.string(),
      blog_subtitle: z.string(),
      faqs: z.string(),
      trust_badges_heading: z.string(),
      more_faqs_button_text: z.string(),
    }),
    // How it works steps
    steps: z.array(
      z.object({
        title: z.string(),
        text: z.string(),
        icon: z.string(),
        joined_to_previous: z.boolean().default(true),
      })
    ),
    // Optional Eventbrite link
    eventbrite: z
      .object({
        description: z.string().optional(),
        text: z.string(),
        url: z.string(),
      })
      .optional(),
    // SEO settings
    seo_settings: z
      .object({
        metaTitle: z.string().max(60).optional(),
        metaDescription: z.string().min(120).max(160).optional(),
      })
      .optional(),
  }),
});

// Testimonials (site-specific)
const testimonialCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: `src/content/${WEBSITE_ID}/testimonials` }),
  schema: z.object({
    name: z.string().optional(),
    testimonial: z.string(),
    order: z.number().default(1),
    published: z.boolean().default(true),
  }),
});

// Medical conditions (site-specific)
const medicalConditionCollection = defineCollection({
  loader: glob({ pattern: '*.{md,yaml}', base: `src/content/${WEBSITE_ID}/medical-conditions` }),
  schema: z.object({
    name: z.string(),
    alternate_names: z.array(z.string()).optional(),
    description: z.string(),
    signs_symptoms: z.array(z.string()).optional(),
    affected_anatomy: z.string().default('Brain'),
    possible_treatments: z
      .array(
        z.object({
          name: z.string(),
          type: z.enum(['MedicalTherapy', 'Drug', 'LifestyleModification']),
        })
      )
      .optional(),
    show_on_services: z.boolean().default(true),
    published: z.boolean().default(true),
  }),
});

export const collections = {
  post: postCollection,
  faqs_page_items: faqCollection,
  services_page_items: serviceCollection,
  site_settings_trust_badges: trustBadgeCollection,
  text_pages: textPageCollection,
  services_page_top_content: servicesPageTopContentCollection,
  faqs_page_top_content: faqsPageTopContentCollection,
  consultation_page: consultationPageCollection,
  contact_page: contactPageCollection,
  waitlist_page: waitlistPageCollection,
  home_page: homePageCollection,
  medical_conditions: medicalConditionCollection,
  testimonials: testimonialCollection,
};
