import { readFileSync, existsSync } from 'fs';

const files = [
  'dist/index.html',
  'dist/services/index.html',
  'dist/privacy-policy/index.html',
  'dist/blog/get-started-website-with-astro-tailwind-css/index.html',
];

files.forEach((file) => {
  if (!existsSync(file)) {
    console.log(`\n❌ File not found: ${file}`);
    return;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`FILE: ${file}`);
  console.log('='.repeat(80));

  const html = readFileSync(file, 'utf8');
  const scripts = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs);

  if (!scripts || scripts.length === 0) {
    console.log('❌ No schemas found');
    return;
  }

  console.log(`\n✅ Found ${scripts.length} schema(s)\n`);

  scripts.forEach((scriptTag, i) => {
    const json = scriptTag.replace(/<script type="application\/ld\+json">|<\/script>/gs, '');
    try {
      const parsed = JSON.parse(json);
      console.log(`\n--- Schema ${i + 1}: ${parsed['@type'] || 'Unknown'} ---`);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(`\n❌ Schema ${i + 1} - Parse error:`, e.message);
      console.log('Raw content:', json.substring(0, 200));
    }
  });
});
