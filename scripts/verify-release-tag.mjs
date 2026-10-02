import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const expectedTag = `v${packageJson.version}`;

if (process.env.RELEASE_TAG !== expectedTag) {
  console.error(`Release tag must be ${expectedTag}; received ${process.env.RELEASE_TAG ?? 'none'}`);
  process.exitCode = 1;
}
