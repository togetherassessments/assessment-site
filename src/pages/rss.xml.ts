import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

import { getSiteSettings } from '~/utils/site-settings';
import { APP_BLOG } from 'astrowind:config';
import { fetchPosts } from '~/utils/blog';
import { getPermalink } from '~/utils/permalinks';

const settings = getSiteSettings();

export async function GET(context: APIContext) {
  if (!APP_BLOG.isEnabled) {
    return new Response(null, {
      status: 404,
      statusText: 'Not found',
    });
  }

  const posts = await fetchPosts();

  return rss({
    title: `${settings.site.name}'s Blog`,
    description: settings.seo?.description || '',
    site: context.site ?? import.meta.env.SITE,

    items: posts.map((post) => ({
      link: getPermalink(post.permalink, 'post'),
      title: post.title,
      description: post.excerpt,
      pubDate: post.publishDate,
    })),
  });
}
