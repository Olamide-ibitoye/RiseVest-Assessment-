const fs = require('fs');
const path = require('path');

function normalizeTitle(suiteTitles, testTitle) {
  return [...suiteTitles.filter(Boolean), testTitle].join(' > ');
}

function collectTestsFromSuite(suite, suiteTitles = [], out = []) {
  const nextTitles = suite.title ? [...suiteTitles, suite.title] : suiteTitles;

  if (Array.isArray(suite.specs)) {
    for (const spec of suite.specs) {
      const specTitle = spec.title;
      const tests = Array.isArray(spec.tests) ? spec.tests : [];

      for (const t of tests) {
        const results = Array.isArray(t.results) ? t.results : [];
        const final = results[results.length - 1] || {};
        const status = final.status || t.status || 'unknown';
        const duration = typeof final.duration === 'number' ? final.duration : 0;

        out.push({
          project: t.projectName || 'unknown',
          title: normalizeTitle(nextTitles, specTitle),
          status,
          durationMs: duration,
        });
      }
    }
  }

  if (Array.isArray(suite.suites)) {
    for (const child of suite.suites) {
      collectTestsFromSuite(child, nextTitles, out);
    }
  }

  return out;
}

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!inputPath || !outputPath) {
    console.error('Usage: node scripts/generate-test-summary.js <input-json> <output-md>');
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf8');
  const withoutBom = raw.replace(/^\uFEFF/, '');
  const data = JSON.parse(withoutBom);

  const suites = data.suites || [];
  const rows = [];

  for (const suite of suites) {
    collectTestsFromSuite(suite, [], rows);
  }

  rows.sort((a, b) => (a.project || '').localeCompare(b.project || '') || (a.title || '').localeCompare(b.title || ''));

  const total = rows.length;
  const passed = rows.filter(r => r.status === 'passed').length;
  const failed = rows.filter(r => r.status === 'failed').length;
  const skipped = rows.filter(r => r.status === 'skipped').length;
  const timedOut = rows.filter(r => r.status === 'timedOut').length;

  const lines = [];
  lines.push('# Playwright Test Results (Pass/Fail)');
  lines.push('');
  lines.push(`Generated from: \`${path.basename(inputPath)}\``);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total: ${total}`);
  lines.push(`- Passed: ${passed}`);
  lines.push(`- Failed: ${failed}`);
  lines.push(`- Skipped: ${skipped}`);
  lines.push(`- Timed out: ${timedOut}`);
  lines.push('');
  lines.push('## Results');
  lines.push('');
  lines.push('| Project | Test | Status | Duration (ms) |');
  lines.push('|---|---|---|---:|');

  for (const r of rows) {
    const safeTitle = String(r.title || '').replace(/\|/g, '\\|');
    lines.push(`| ${r.project} | ${safeTitle} | ${r.status} | ${r.durationMs} |`);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');

  console.log(`Wrote ${outputPath}`);
}

main();
