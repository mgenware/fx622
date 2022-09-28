#!/usr/bin/env node
import meow from 'meow';
import chalk from 'chalk';
import sharp from 'sharp';
import rename from 'node-rename-path';

const trimTop = 132;
const trimBottom = 64;

function log(s: unknown) {
  // eslint-disable-next-line no-console
  console.log(s);
}

function logError(s: unknown) {
  return log(chalk.red(s));
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const cli = meow(
    `
  Usage
    $ npx fx622 <file>
  
  `,
    {
      importMeta: import.meta,
    },
  );

  const imgFile = cli.input[0];
  if (!imgFile) {
    logError('Missing <file>. See --help for help');
    process.exit(1);
  }

  const destFile = rename(imgFile, (pathObj) => ({
    name: `${pathObj.name}_trimmed`,
  }));
  const image = sharp(imgFile);
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error('Unexpected empty dimensions');
  }
  await image
    .extract({
      left: 0,
      top: trimTop,
      width: metadata.width,
      height: metadata.height - trimBottom - trimTop,
    })
    .toFile(destFile);

  // eslint-disable-next-line no-console
  console.log(`Output written to "${destFile}"`);
})();
