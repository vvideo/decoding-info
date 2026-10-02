import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
assert.ok(packageJson.files.includes('dist'), 'The package archive must include dist');

for (const field of ['main', 'module', 'types']) {
  assert.ok(packageJson[field], `package.json is missing ${field}`);
  assert.ok(
    existsSync(new URL(`../${packageJson[field]}`, import.meta.url)),
    `${field} points to a missing file: ${packageJson[field]}`,
  );
}

const entryPoints = packageJson.exports?.['.'];
assert.ok(entryPoints?.import, 'Missing import export');
assert.ok(entryPoints?.require, 'Missing require export');
assert.ok(entryPoints?.types, 'Missing types export');

const require = createRequire(import.meta.url);
const commonJs = require(packageJson.name);
const esModule = await import(packageJson.name);
const directEsModule = await import(`${packageJson.name}/dist/index.esm.js`);
assert.equal(require(`${packageJson.name}/package.json`).version, packageJson.version);

for (const [format, entryPoint] of [
  ['CommonJS', commonJs],
  ['ES module', esModule],
  ['direct ES module', directEsModule],
]) {
  assert.equal(
    typeof entryPoint.getVideoCodecSupportedResolution,
    'function',
    `${format} entry point does not export getVideoCodecSupportedResolution`,
  );
}

const distFiles = readdirSync(new URL('../dist/', import.meta.url), { recursive: true });
assert.deepEqual(
  distFiles.filter((file) => file.endsWith('.test.d.ts')),
  [],
  'Test declarations should not be included in the package',
);

console.log('Package entry points and declarations are valid.');
