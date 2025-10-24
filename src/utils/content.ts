/**
 * Content processing utilities for SEO
 */

/**
 * Count words in content for Article schema wordCount property
 */
export function countWords(content: string): number {
  return content
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter((word) => word.length > 0).length;
}

/**
 * Truncate text to a maximum length, adding ellipsis if truncated
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Strip markdown formatting from text
 * Used for generating plain-text meta descriptions from markdown content
 */
export function stripMarkdown(text: string): string {
  return (
    text
      // Remove headers
      .replace(/#{1,6}\s+/g, '')
      // Remove bold/italic markers
      .replace(/[*_~`]/g, '')
      // Extract link text: [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images: ![alt](url) -> ''
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Replace newlines with spaces
      .replace(/\n+/g, ' ')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Get the most recent date from multiple date values
 * Used for determining article:modified_time in BlogPosting schema
 */
export function getMostRecentDate(...dates: (Date | undefined)[]): Date | undefined {
  const validDates = dates.filter((d): d is Date => d !== undefined);
  if (validDates.length === 0) return undefined;
  return new Date(Math.max(...validDates.map((d) => d.getTime())));
}
