---
description: Run Lighthouse performance testing and analyse results
---

# Lighthouse Performance Testing Command

You are running the Lighthouse performance testing command. This command runs Google PageSpeed Insights-compatible audits and provides detailed feedback on performance, accessibility, best practices, and SEO.

## Task Requirements

1. **Parse the user's input** to extract the target:
   - The user MUST provide a second parameter after `/lighthouse`
   - Valid formats: `/lighthouse /about` or `/lighthouse all`
   - If `/lighthouse` is called without a parameter, respond with usage instructions and do NOT proceed
   - Example valid: `/lighthouse /about`, `/lighthouse all`, `/lighthouse /`
   - Example invalid: `/lighthouse` (missing target)

2. **Validate the target**:
   - If target is `all`: run lighthouse on all public pages
   - If target looks like a route (starts with `/`): run lighthouse on that specific page
   - Otherwise: show error and usage instructions

3. **Build before testing**:
   - **REQUIRED**: Run fresh production build before Lighthouse tests
   - Command: `cross-env ASSESSMENTS_URL=http://localhost:4321 ADHD_URL=http://localhost:4321 AUTISM_URL=http://localhost:4321 npm run build:assessments`
   - This ensures:
     - Latest code changes are tested
     - Pagefind search indexes are generated
     - All optimisations are applied
   - Skip build ONLY if testing immediately after a recent build

4. **Run Lighthouse**:
   - For specific page: `node scripts/lighthouse.js --url=<route> --mobile`
   - For all pages: `npm run lighthouse` (includes build step automatically)
   - **IMPORTANT**: Run synchronously (NOT in background) - the script will complete and exit when done
   - **IMPORTANT**: By default, tests BOTH light and dark themes (can specify `--theme=light` or `--theme=dark` for single theme)
   - Use a timeout of at least 300000ms (5 minutes) for single pages with both themes
   - Use a timeout of at least 600000ms (10 minutes) for 'all' pages with both themes
   - Wait for the command to complete naturally - the script exits cleanly when done

5. **Locate and read the summary reports**:
   - **CRITICAL**: Parse the Lighthouse command output to find the report directory
   - The script prints: "✅ Reports saved to: <directory-path>"
   - Extract this exact directory path from the command output
   - **NEW**: Summary files include theme in filename: `_.light.summary.json`, `_.dark.summary.json`
   - For `/about`: `_about.light.summary.json`, `_about.dark.summary.json`
   - Read BOTH theme files to provide complete analysis
   - These are lightweight (~450 lines each) and contain everything needed for analysis
   - Example: Read both `_.light.summary.json` AND `_.dark.summary.json`

6. **Summary file contains**:
   - `url`: The tested page URL
   - `theme`: The tested theme ('light' or 'dark')
   - `categories`: Scores for performance, accessibility, best-practices, seo
   - `coreWebVitals`: Full details for LCP, CLS, TBT, FCP, Speed Index
   - `failedAudits`: All audits with score < 1, organized by category, including details/snippets

7. **Provide comprehensive feedback**:

   For each page tested, report:

   **a) Overall Scores** (0-100):
   - Performance: [score]/100
   - Accessibility: [score]/100
   - Best Practices: [score]/100
   - SEO: [score]/100

   **b) Core Web Vitals** (Google's ranking factors):
   - LCP (Largest Contentful Paint): [value]s - target <2.5s
   - CLS (Cumulative Layout Shift): [value] - target <0.1
   - TBT (Total Blocking Time): [value]ms - target <200ms
   - FCP (First Contentful Paint): [value]s - target <1.8s
   - Speed Index: [value]s - target <3.4s

   **c) Issues Requiring Attention** (for any category scoring < 100):
   - List ALL failed audits (score < 1) - do not skip any
   - For each failed audit, report:
     - Audit title
     - Score percentage
     - Actual metric value if available
     - Brief explanation of what's wrong
     - Impact on the overall category score (based on audit weight)

   - Prioritise by:
     1. Audits with weight > 0 (these affect the score)
     2. Lower scores first (bigger problems)
     3. Performance and SEO issues over others (Google ranking factors)

   - Group issues by category (Performance, Accessibility, Best Practices, SEO)
   - Show ALL issues, not just the top few

   **d) Actionable Recommendations**:
   - For each failed audit, suggest what to fix
   - Prioritise recommendations for issues that impact Core Web Vitals or SEO
   - Include all issues, even minor ones - the user wants complete information

   **e) Theme Comparison**:
   - Compare scores between light and dark themes
   - Flag any issues that only appear in one theme
   - Note any significant score differences between themes
   - Highlight theme-specific colour contrast issues

8. **Reference your sources**:
   - Always mention which report file(s) you analysed
   - Include the full path to the report directory
   - Example: "Based on `_.light.summary.json` and `_.dark.summary.json`"

9. **Summary for 'all' pages**:
   - Show a comparison table of scores across all pages AND themes
   - Highlight the worst-performing page in each category
   - Note theme-specific issues across pages
   - Provide overall recommendations for site-wide improvements
   - Note any consistent issues appearing across multiple pages or themes

## Usage Examples

```
/lighthouse /about
/lighthouse /
/lighthouse all
```

## Important Notes

- **Build is required first** - Lighthouse tests the production build from `dist/`
- Lighthouse tests take 2-5 minutes per page - don't rush or timeout
- The script uses Astro preview server, testing the production build
- Tests use Google PageSpeed Insights configuration (mobile-first, throttled)
- Scores may vary slightly between runs due to throttling simulation
- Focus on trends and major issues, not minor score variations
- A score of 90+ is excellent, 50-89 needs improvement, <50 is critical

## Error Handling

- If no target provided: explain usage and stop
- If Lighthouse fails: check the error output and report it to the user
- If report files not found: check the lighthouse-reports directory and find the most recent reports
- If build directory missing: remind user to run `npm run build:assessments` first

Begin by validating the user's input, then proceed with running Lighthouse and analysing the results.
