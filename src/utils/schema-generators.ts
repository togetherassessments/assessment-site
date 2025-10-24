/**
 * Schema generation utilities for structured data
 */

/**
 * Generate WebPage schema wrapper for any page
 *
 * @param url - Full page URL
 * @param title - Page title
 * @param dateModified - Last modified date (optional)
 * @param mainEntityId - ID reference to primary schema on page (e.g., #faq, #blog-post)
 * @param breadcrumbId - ID reference to breadcrumb schema (optional)
 * @returns WebPage schema object
 */
export function generateWebPageSchema(
  url: URL,
  title: string,
  dateModified?: Date,
  mainEntityId?: string,
  breadcrumbId?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url.href}#webpage`,
    url: url.href,
    name: title,
    ...(dateModified && {
      dateModified: dateModified.toISOString(),
    }),
    ...(breadcrumbId && {
      breadcrumb: { '@id': breadcrumbId },
    }),
    ...(mainEntityId && {
      mainEntity: { '@id': mainEntityId },
    }),
    isPartOf: {
      '@id': `${url.origin}#website`,
    },
  };
}

/**
 * Generate HomePage schema (special subtype of WebPage)
 */
export function generateHomePageSchema(url: URL, title: string, dateModified?: Date) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomePage',
    '@id': `${url.href}#webpage`,
    url: url.href,
    name: title,
    ...(dateModified && {
      dateModified: dateModified.toISOString(),
    }),
    isPartOf: {
      '@id': `${url.origin}#website`,
    },
  };
}

/**
 * Generate MedicalCondition schema from collection entry
 */
export function generateMedicalConditionSchema(
  condition: {
    id: string;
    data: {
      name: string;
      alternate_names?: string[];
      description: string;
      affected_anatomy?: string;
      signs_symptoms?: string[];
      possible_treatments?: Array<{ name: string; type: string }>;
    };
  },
  siteUrl: URL
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    '@id': `${siteUrl.origin}#condition-${condition.id}`,
    name: condition.data.name,
    ...(condition.data.alternate_names &&
      condition.data.alternate_names.length > 0 && {
        alternateName: condition.data.alternate_names,
      }),
    description: condition.data.description,
    ...(condition.data.affected_anatomy && {
      associatedAnatomy: {
        '@type': 'AnatomicalStructure',
        name: condition.data.affected_anatomy,
      },
    }),
    ...(condition.data.signs_symptoms &&
      condition.data.signs_symptoms.length > 0 && {
        signOrSymptom: condition.data.signs_symptoms.map((symptom: string) => ({
          '@type': 'MedicalSymptom',
          name: symptom,
        })),
      }),
    ...(condition.data.possible_treatments &&
      condition.data.possible_treatments.length > 0 && {
        possibleTreatment: condition.data.possible_treatments.map((treatment) => ({
          '@type': treatment.type,
          name: treatment.name,
        })),
      }),
  };
}
