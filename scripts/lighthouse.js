#!/usr/bin/env node

/**
 * Lighthouse Testing Script
 *
 * Runs Lighthouse audits matching Google PageSpeed Insights configuration.
 * Tests production build via Astro preview server for accurate results.
 *
 * Usage:
 *   npm run lighthouse              # Run on all pages (mobile)
 *   npm run lighthouse:mobile       # Mobile testing
 *   npm run lighthouse:desktop      # Desktop testing
 *   node scripts/lighthouse.js --url=/about  # Test specific page
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer-core';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  buildDir: path.join(__dirname, '..', 'dist'),
  reportsDir: path.join(__dirname, '..', 'lighthouse-reports'),
  serverPort: 8080,
  excludePatterns: ['/admin'],
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    device: 'mobile', // default
    url: null,
    theme: 'both', // default: test both themes
  };

  args.forEach((arg) => {
    if (arg === '--desktop') options.device = 'desktop';
    if (arg === '--mobile') options.device = 'mobile';
    if (arg.startsWith('--url=')) {
      let url = arg.split('=')[1];
      // Handle Git Bash on Windows converting /path to C:/Program Files/Git/path
      if (url.includes('Git/')) {
        url = '/' + url.split('Git/')[1];
      }
      // Ensure URL starts with /
      if (!url.startsWith('/')) {
        url = '/' + url;
      }
      options.url = url;
    }
    if (arg.startsWith('--theme=')) {
      const theme = arg.split('=')[1];
      if (['light', 'dark', 'both'].includes(theme)) {
        options.theme = theme;
      }
    }
  });

  return options;
}

/**
 * Recursively find all HTML files in the dist directory
 * Returns URLs without trailing slashes (matching Astro routing)
 */
function discoverPages(dir, baseDir = dir) {
  let pages = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      pages = pages.concat(discoverPages(fullPath, baseDir));
    } else if (item === 'index.html') {
      // Convert file path to URL path (without trailing slash)
      const relativePath = path.relative(baseDir, dir);
      const urlPath = relativePath ? '/' + relativePath.split(path.sep).join('/') : '/';
      pages.push(urlPath);
    }
  }

  return pages;
}

/**
 * Filter out excluded pages (e.g., CMS admin pages)
 */
function filterPages(pages) {
  return pages.filter((page) => {
    return !CONFIG.excludePatterns.some((pattern) => page.startsWith(pattern));
  });
}

/**
 * Start Astro preview server for the built site
 */
function startServer() {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue(`\n📡 Starting Astro preview server on port ${CONFIG.serverPort}...\n`));

    const serverProcess = spawn('npx', ['astro', 'preview', '--port', CONFIG.serverPort.toString(), '--host'], {
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, WEBSITE_ID: 'assessments' },
    });

    let started = false;

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if ((output.includes('Local') || output.includes('localhost')) && !started) {
        started = true;
        setTimeout(() => resolve(serverProcess), 2000); // Wait 2s for server to be fully ready
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      // Astro sends some info to stderr, only log if it looks like an error
      if (output.includes('error') || output.includes('Error')) {
        console.error(chalk.red(output));
      }
    });

    serverProcess.on('error', (error) => {
      reject(error);
    });

    // Timeout after 15 seconds
    setTimeout(() => {
      if (!started) {
        reject(new Error('Server failed to start within 15 seconds'));
      }
    }, 15000);
  });
}

/**
 * Stop the preview server
 */
function stopServer(serverProcess) {
  if (serverProcess) {
    console.log(chalk.blue('\n📡 Stopping preview server...\n'));
    serverProcess.kill();
  }
}

/**
 * Get Lighthouse configuration matching Google PageSpeed Insights
 */
function getLighthouseConfig(device) {
  const config = {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      output: ['html', 'json'],
      maxWaitForLoad: 45000,
      formFactor: device === 'mobile' ? 'mobile' : 'desktop',
      // Google PSI uses Moto G Power for mobile
      screenEmulation:
        device === 'mobile'
          ? { mobile: true, width: 412, height: 823, deviceScaleFactor: 2.625, disabled: false }
          : { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
      // Throttling to match Google PSI
      throttling:
        device === 'mobile'
          ? {
              rttMs: 150,
              throughputKbps: 1638.4,
              requestLatencyMs: 150 * 3.75,
              downloadThroughputKbps: 1638.4,
              uploadThroughputKbps: 768,
              cpuSlowdownMultiplier: 4,
            }
          : {
              rttMs: 40,
              throughputKbps: 10240,
              requestLatencyMs: 0,
              downloadThroughputKbps: 0,
              uploadThroughputKbps: 0,
              cpuSlowdownMultiplier: 1,
            },
    },
  };

  return config;
}

/**
 * Set theme in browser localStorage before running Lighthouse
 */
async function setThemeInBrowser(chromePort, url, theme) {
  try {
    const browser = await puppeteer.connect({
      browserURL: `http://localhost:${chromePort}`,
      defaultViewport: null,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Set localStorage.theme
    await page.evaluate((themeValue) => {
      localStorage.setItem('theme', themeValue);
    }, theme);

    await page.close();
    // Don't disconnect - Lighthouse will reuse this browser
  } catch (error) {
    console.error(chalk.red(`Failed to set theme in browser: ${error.message}`));
    throw error;
  }
}

/**
 * Run Lighthouse on a single URL
 */
async function runLighthouseOnUrl(url, device, chrome, theme) {
  const config = getLighthouseConfig(device);
  const fullUrl = `http://localhost:${CONFIG.serverPort}${url}`;

  // Set theme before running Lighthouse
  await setThemeInBrowser(chrome.port, fullUrl, theme);

  console.log(chalk.cyan(`  🔍 Testing: ${url} (${device}, ${theme} theme)`));

  const runnerResult = await lighthouse(
    fullUrl,
    {
      port: chrome.port,
      output: ['html', 'json'],
    },
    config
  );

  return {
    url,
    theme,
    lhr: runnerResult.lhr,
    report: runnerResult.report,
  };
}

/**
 * Display Core Web Vitals for a page
 */
function displayCoreWebVitals(result) {
  const { audits } = result.lhr;

  console.log(chalk.bold(`\n  Core Web Vitals:`));

  // Largest Contentful Paint
  const lcp = audits['largest-contentful-paint'];
  const lcpValue = lcp?.numericValue ? (lcp.numericValue / 1000).toFixed(2) + 's' : 'N/A';
  const lcpColor = lcp?.score >= 0.9 ? chalk.green : lcp?.score >= 0.5 ? chalk.yellow : chalk.red;
  console.log(`    LCP (Largest Contentful Paint): ${lcpColor(lcpValue)}`);

  // Cumulative Layout Shift
  const cls = audits['cumulative-layout-shift'];
  const clsValue = cls?.numericValue !== undefined ? cls.numericValue.toFixed(3) : 'N/A';
  const clsColor = cls?.score >= 0.9 ? chalk.green : cls?.score >= 0.5 ? chalk.yellow : chalk.red;
  console.log(`    CLS (Cumulative Layout Shift): ${clsColor(clsValue)}`);

  // Total Blocking Time (proxy for INP/FID)
  const tbt = audits['total-blocking-time'];
  const tbtValue = tbt?.numericValue ? tbt.numericValue.toFixed(0) + 'ms' : 'N/A';
  const tbtColor = tbt?.score >= 0.9 ? chalk.green : tbt?.score >= 0.5 ? chalk.yellow : chalk.red;
  console.log(`    TBT (Total Blocking Time): ${tbtColor(tbtValue)}`);

  // First Contentful Paint
  const fcp = audits['first-contentful-paint'];
  const fcpValue = fcp?.numericValue ? (fcp.numericValue / 1000).toFixed(2) + 's' : 'N/A';
  const fcpColor = fcp?.score >= 0.9 ? chalk.green : fcp?.score >= 0.5 ? chalk.yellow : chalk.red;
  console.log(`    FCP (First Contentful Paint): ${fcpColor(fcpValue)}`);

  // Speed Index
  const si = audits['speed-index'];
  const siValue = si?.numericValue ? (si.numericValue / 1000).toFixed(2) + 's' : 'N/A';
  const siColor = si?.score >= 0.9 ? chalk.green : si?.score >= 0.5 ? chalk.yellow : chalk.red;
  console.log(`    Speed Index: ${siColor(siValue)}`);
}

/**
 * Display failed audits grouped by category
 */
function displayIssues(result) {
  const { categories, audits } = result.lhr;

  const issuesByCategory = {
    performance: [],
    accessibility: [],
    'best-practices': [],
    seo: [],
  };

  // Collect failed audits by category
  Object.entries(categories).forEach(([categoryId, category]) => {
    if (category.auditRefs) {
      category.auditRefs.forEach((auditRef) => {
        const audit = audits[auditRef.id];
        // Show audits that failed (score < 1) and have a displayValue or description
        if (audit && audit.score !== null && audit.score < 1 && auditRef.weight > 0) {
          issuesByCategory[categoryId]?.push({
            id: auditRef.id,
            title: audit.title,
            description: audit.description,
            score: audit.score,
            displayValue: audit.displayValue,
            weight: auditRef.weight,
          });
        }
      });
    }
  });

  // Display issues for each category
  Object.entries(issuesByCategory).forEach(([categoryId, issues]) => {
    if (issues.length > 0) {
      const categoryName =
        categoryId === 'best-practices' ? 'Best Practices' : categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
      console.log(chalk.bold(`\n  ${categoryName} Issues:`));

      // Sort by weight (importance) and score
      issues.sort((a, b) => b.weight - a.weight || a.score - b.score);

      // Show top 5 issues per category
      issues.slice(0, 5).forEach((issue) => {
        const scoreColor = issue.score < 0.5 ? chalk.red : chalk.yellow;
        const scorePercent = Math.round(issue.score * 100);
        console.log(`    ${scoreColor('✗')} ${issue.title} ${scoreColor(`(${scorePercent}%)`)}`);
        if (issue.displayValue) {
          console.log(`      ${chalk.gray(issue.displayValue)}`);
        }
      });

      if (issues.length > 5) {
        console.log(chalk.gray(`    ... and ${issues.length - 5} more issues`));
      }
    }
  });
}

/**
 * Display detailed results for a single page
 */
function displayPageResults(result) {
  console.log(chalk.bold.cyan(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));
  console.log(chalk.bold.cyan(`  ${result.url}`));
  console.log(chalk.bold.cyan(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));

  const scores = {
    performance: result.lhr.categories.performance?.score ?? 0,
    accessibility: result.lhr.categories.accessibility?.score ?? 0,
    bestPractices: result.lhr.categories['best-practices']?.score ?? 0,
    seo: result.lhr.categories.seo?.score ?? 0,
  };

  const formatScore = (score) => {
    const percentage = Math.round(score * 100);
    if (percentage >= 90) return chalk.green(`${percentage}`);
    if (percentage >= 50) return chalk.yellow(`${percentage}`);
    return chalk.red(`${percentage}`);
  };

  console.log(chalk.bold(`\n  Scores:`));
  console.log(`    Performance:    ${formatScore(scores.performance)}/100`);
  console.log(`    Accessibility:  ${formatScore(scores.accessibility)}/100`);
  console.log(`    Best Practices: ${formatScore(scores.bestPractices)}/100`);
  console.log(`    SEO:            ${formatScore(scores.seo)}/100`);

  displayCoreWebVitals(result);
  displayIssues(result);

  console.log(''); // Empty line for spacing
}

/**
 * Generate summary data for Claude Code analysis
 */
function generateSummary(result) {
  const lhr = result.lhr;

  // Extract category scores
  const categories = {};
  Object.entries(lhr.categories).forEach(([key, cat]) => {
    categories[key] = {
      score: cat.score,
      title: cat.title,
    };
  });

  // Extract Core Web Vitals
  const coreWebVitals = {
    'largest-contentful-paint': lhr.audits['largest-contentful-paint'],
    'cumulative-layout-shift': lhr.audits['cumulative-layout-shift'],
    'total-blocking-time': lhr.audits['total-blocking-time'],
    'first-contentful-paint': lhr.audits['first-contentful-paint'],
    'speed-index': lhr.audits['speed-index'],
  };

  // Extract all failed audits (score < 1) with weight > 0
  const failedAudits = {};
  Object.entries(lhr.categories).forEach(([catKey, cat]) => {
    if (cat.auditRefs) {
      cat.auditRefs.forEach((ref) => {
        const audit = lhr.audits[ref.id];
        if (audit && audit.score !== null && audit.score < 1 && ref.weight > 0) {
          if (!failedAudits[catKey]) failedAudits[catKey] = [];
          failedAudits[catKey].push({
            id: ref.id,
            title: audit.title,
            description: audit.description,
            score: audit.score,
            displayValue: audit.displayValue,
            weight: ref.weight,
            details: audit.details,
          });
        }
      });
    }
  });

  return {
    url: result.url,
    theme: result.theme,
    finalUrl: lhr.finalUrl,
    fetchTime: lhr.fetchTime,
    categories,
    coreWebVitals,
    failedAudits,
  };
}

/**
 * Save Lighthouse reports
 */
function saveReports(results, device) {
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(CONFIG.reportsDir)) {
    fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const deviceDir = path.join(CONFIG.reportsDir, `${device}-${timestamp}`);
  fs.mkdirSync(deviceDir, { recursive: true });

  // Generate summaries for all results
  const summaries = results.map((result) => generateSummary(result));

  results.forEach((result, index) => {
    const sanitizedUrl = result.url.replace(/\//g, '_') || '_root';
    const filename = `${sanitizedUrl}.${result.theme}`;
    const htmlReport = Array.isArray(result.report) ? result.report[0] : result.report;
    const jsonReport = Array.isArray(result.report) ? result.report[1] : result.report;

    // Save HTML report
    fs.writeFileSync(path.join(deviceDir, `${filename}.html`), htmlReport);

    // Save full JSON report
    fs.writeFileSync(
      path.join(deviceDir, `${filename}.json`),
      typeof jsonReport === 'string' ? jsonReport : JSON.stringify(result.lhr, null, 2)
    );

    // Save summary JSON (lightweight, for Claude Code analysis)
    fs.writeFileSync(path.join(deviceDir, `${filename}.summary.json`), JSON.stringify(summaries[index], null, 2));
  });

  console.log(chalk.green(`\n✅ Reports saved to: ${deviceDir}\n`));
  return deviceDir;
}

/**
 * Display summary table of results
 */
function displaySummary(results, device) {
  console.log(chalk.bold(`\n📊 Summary (${device.toUpperCase()})\n`));
  console.log(chalk.gray('─'.repeat(88)));
  console.log(
    chalk.bold('Page'.padEnd(27)) +
      chalk.bold('Theme'.padEnd(8)) +
      chalk.bold('Perf'.padEnd(8)) +
      chalk.bold('A11y'.padEnd(8)) +
      chalk.bold('Best'.padEnd(8)) +
      chalk.bold('SEO'.padEnd(8))
  );
  console.log(chalk.gray('─'.repeat(88)));

  results.forEach((result) => {
    const scores = {
      performance: result.lhr.categories.performance?.score ?? 0,
      accessibility: result.lhr.categories.accessibility?.score ?? 0,
      bestPractices: result.lhr.categories['best-practices']?.score ?? 0,
      seo: result.lhr.categories.seo?.score ?? 0,
    };

    const formatScore = (score) => {
      const percentage = Math.round(score * 100);
      let color = chalk.red;
      if (percentage >= 90) color = chalk.green;
      else if (percentage >= 50) color = chalk.yellow;
      return color(percentage.toString().padEnd(8));
    };

    console.log(
      result.url.padEnd(27) +
        result.theme.padEnd(8) +
        formatScore(scores.performance) +
        formatScore(scores.accessibility) +
        formatScore(scores.bestPractices) +
        formatScore(scores.seo)
    );
  });

  console.log(chalk.gray('─'.repeat(88)));

  // Calculate averages
  const avgScores = {
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0,
  };

  results.forEach((result) => {
    avgScores.performance += result.lhr.categories.performance?.score ?? 0;
    avgScores.accessibility += result.lhr.categories.accessibility?.score ?? 0;
    avgScores.bestPractices += result.lhr.categories['best-practices']?.score ?? 0;
    avgScores.seo += result.lhr.categories.seo?.score ?? 0;
  });

  Object.keys(avgScores).forEach((key) => {
    avgScores[key] = avgScores[key] / results.length;
  });

  const formatAvgScore = (score) => {
    const percentage = Math.round(score * 100);
    let color = chalk.red;
    if (percentage >= 90) color = chalk.green;
    else if (percentage >= 50) color = chalk.yellow;
    return color(percentage.toString().padEnd(8));
  };

  console.log(
    chalk.bold('AVERAGE'.padEnd(35)) +
      formatAvgScore(avgScores.performance) +
      formatAvgScore(avgScores.accessibility) +
      formatAvgScore(avgScores.bestPractices) +
      formatAvgScore(avgScores.seo)
  );
  console.log(chalk.gray('─'.repeat(88)) + '\n');
}

/**
 * Main execution function
 */
async function main() {
  const options = parseArgs();
  let serverProcess = null;
  let chrome = null;

  try {
    console.log(chalk.bold.cyan('\n🚀 Lighthouse Performance Testing (Google PSI Configuration)\n'));

    // Check if build directory exists
    if (!fs.existsSync(CONFIG.buildDir)) {
      throw new Error(`Build directory not found: ${CONFIG.buildDir}\nPlease run 'npm run build:assessments' first.`);
    }

    // Discover and filter pages
    let pages;
    if (options.url) {
      pages = [options.url];
      console.log(chalk.blue(`Testing single page: ${options.url}\n`));
    } else {
      const allPages = discoverPages(CONFIG.buildDir);
      pages = filterPages(allPages);
      console.log(chalk.blue(`Found ${allPages.length} pages (${pages.length} public-facing)\n`));
    }

    if (pages.length === 0) {
      throw new Error('No pages found to test');
    }

    // Start Astro preview server
    serverProcess = await startServer();

    // Launch Chrome
    console.log(chalk.blue('🚀 Launching Chrome...\n'));
    chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

    // Run Lighthouse on each page with each theme
    const results = [];
    const themes = options.theme === 'both' ? ['light', 'dark'] : [options.theme];
    const totalTests = pages.length * themes.length;

    for (let i = 0; i < pages.length; i++) {
      for (const theme of themes) {
        console.log(chalk.cyan(`[${results.length + 1}/${totalTests}]`));
        const result = await runLighthouseOnUrl(pages[i], options.device, chrome, theme);
        results.push(result);

        // Display detailed results for this page
        displayPageResults(result);
      }
    }

    // Save reports and display summary
    const reportsDir = saveReports(results, options.device);
    displaySummary(results, options.device);

    console.log(chalk.green(`✅ Testing complete! View detailed HTML reports at:\n   ${reportsDir}\n`));
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
    process.exit(1);
  } finally {
    // Cleanup
    if (chrome) {
      await chrome.kill();
    }
    if (serverProcess) {
      stopServer(serverProcess);
    }
  }

  // Exit cleanly after successful completion
  process.exit(0);
}

// Run the script
main();
