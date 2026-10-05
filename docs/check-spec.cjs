// Documentation/fixture checks; runtime behavior is verified by Vitest/Playwright.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const required = ['PRODUCT_SPEC', 'ARCHITECTURE', 'DATA_MODEL', 'PLANNER_ALGORITHM', 'UX_SPEC', 'PRIVACY', 'IMPLEMENTATION_PLAN'];
for (const name of required) assert(fs.existsSync(path.join(__dirname, `${name}.md`)), `Missing ${name}`);
const taskText = fs.readFileSync(path.join(root, 'TASKS.md'), 'utf8');
const tasks = new Map();
for (const line of taskText.split('\n')) {
  const match = line.match(/^- \[([ x])\] \*\*((?:T\d{2}|A00))\b.*?Dependencies: ([^.]+)\./);
  if (!match) continue;
  assert(!tasks.has(match[2]), `Duplicate task ${match[2]}`);
  tasks.set(match[2], { checked: match[1] === 'x', deps: match[3].match(/(?:T\d{2}|A00)/g) || [] });
}
assert.equal(tasks.size, 28, 'A00 + 27 implementation tasks expected');
assert(tasks.get('A00').checked, 'Architecture task should be complete');
assert(!tasks.get('T22').checked, 'Real HAW format acceptance requires a representative permitted sample; synthetic tests alone are insufficient');
const done = new Set();
function visit(id, active = new Set()) {
  assert(tasks.has(id), `Missing dependency ${id}`);
  assert(!active.has(id), `Dependency cycle at ${id}`);
  if (done.has(id)) return;
  const next = new Set(active).add(id);
  for (const dep of tasks.get(id).deps) visit(dep, next);
  done.add(id);
}
for (const id of tasks.keys()) visit(id);
const markdown = [path.join(root, 'TASKS.md'), ...fs.readdirSync(__dirname).filter(f => f.endsWith('.md')).map(f => path.join(__dirname, f))];
let localLinks = 0;
for (const file of markdown) {
  const content = fs.readFileSync(file, 'utf8');
  assert(!content.includes('\uFFFD'), `Replacement character in ${file}`);
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^[a-z]+:/i.test(target) || target.startsWith('#')) continue;
    const clean = target.split('#')[0];
    assert(fs.existsSync(path.resolve(path.dirname(file), clean)), `Broken link ${file}: ${target}`);
    localLinks++;
  }
  assert.equal((content.match(/^```/gm) || []).length % 2, 0, `Unbalanced code fence in ${file}`);
}
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/recovery-scenario.json'), 'utf8'));
assert.equal(fixture.datasetKind, 'synthetic-test-only');
assert.equal(fixture.progress.length, 12);
assert.equal(new Set(fixture.progress.map(p => p.moduleId)).size, fixture.progress.length);
const statuses = new Set(['not_started', 'registered', 'in_progress', 'passed', 'failed']);
for (const record of fixture.progress) for (const status of Object.values(record.components)) assert(statuses.has(status));
const examOnly = fixture.progress.filter(p => p.components.exam !== 'passed' && Object.entries(p.components).filter(([k]) => k !== 'exam').every(([,v]) => v === 'passed')).map(p => p.moduleId);
assert.deepEqual(examOnly, fixture.expected.examOnlyModules);
assert.equal(fixture.progress.find(p => p.moduleId === 'el2').components.lab, 'failed');
assert.deepEqual(fixture.firstYearRemaining, fixture.expected.topAcademicPrioritySet);
assert.equal(new Set([...fixture.firstYearRemaining, ...fixture.otherFirstYearExplicitlyPassed]).size, 11);
const minute = value => { const [h, m] = value.split(':').map(Number); return h * 60 + m; };
const [a, b, c] = fixture.syntheticGroupCases;
assert.equal(Math.min(minute(a.end), minute(b.end)) - Math.max(minute(a.start), minute(b.start)), 90);
assert.equal(a.date, b.date);
assert.notEqual(a.date, c.date);
console.log(`PASS: ${markdown.length} Markdown files, ${localLinks} local links, 28 acyclic tasks, recovery fixture invariants. Domain contract typecheck is a separate command.`);
