/**
 * Breadcrumb generation for Schema.org BreadcrumbList
 */

/**
 * Generate Schema.org BreadcrumbList from URL pathname
 * Used on all pages except homepage for SEO breadcrumb trails
 */
export function generateBreadcrumbs(pathname: string, siteUrl: URL, pageTitle?: string) {
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl.href,
    },
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    breadcrumbs.push({
      '@type': 'ListItem',
      position: index + 2,
      name: isLast && pageTitle ? pageTitle : formatSlug(segment),
      item: new URL(currentPath, siteUrl).href,
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs,
  };
}

/**
 * Format URL slug into readable title
 * e.g., 'blog-post-title' -> 'Blog Post Title'
 */
export function formatSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
