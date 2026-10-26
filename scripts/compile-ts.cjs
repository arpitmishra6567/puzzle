#!/usr/bin/env node
/**
 * Compiles TypeScript modules in `src/` to CommonJS in `dist/` using `@babel/core`
 * and `@babel/preset-typescript`. Resolves packages portably from local `node_modules`
 * first with automatic fallback to system Node paths.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const DIST_DIR = path.join(ROOT, 'build');

const SEARCH_PATHS = [
  path.join(ROOT, 'node_modules'),
  ...module.paths,
  '/usr/share/nodejs'
];

function resolvePkg(pkgName) {
  return require.resolve(pkgName, { paths: SEARCH_PATHS });
}

const babel = require(resolvePkg('@babel/core'));
const presetTypescript = resolvePkg('@babel/preset-typescript');
const pluginCommonJs = resolvePkg('@babel/plugin-transform-modules-commonjs');

const KNOWN_TS_FILES = [
  'types/puzzle.ts',
  'engines/neon.ts',
  'engines/currents.ts',
  'engines/snippets.ts',
  'engines/wordsmith.ts',
  'engines/starstruck.ts',
  'engines/bonza.ts',
  'engines/waywords.ts',
  'engines/crossover.ts',
  'engines/jigsaw.ts',
  'engines/combo.ts',
  'engines/sudoku.ts',
  'engines/shapes.ts',
  'engines/keysmash.ts',
  'engines/index.ts',
  'data/stock_images.ts',
  'data/puzzles.ts',
  'lib/daily_generator.ts',
  'lib/daily.ts',
  'lib/storage.ts',
  'lib/audio.ts',
  'lib/app_main.ts'
];

function walk(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(full));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      results.push(full);
    }
  }
  return results;
}

function compileAll() {
  fs.mkdirSync(DIST_DIR, { recursive: true });
  const fileSet = new Set(walk(SRC_DIR));
  for (const rel of KNOWN_TS_FILES) {
    const full = path.join(SRC_DIR, rel);
    if (fs.existsSync(full)) {
      fileSet.add(full);
    }
  }

  let compiledCount = 0;
  for (const file of fileSet) {
    const rel = path.relative(SRC_DIR, file);
    const outRel = rel.replace(/\.tsx?$/, '.js');
    const outPath = path.join(DIST_DIR, outRel);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const code = fs.readFileSync(file, 'utf8');
    const result = babel.transformSync(code, {
      filename: file,
      presets: [
        [presetTypescript, { allExtensions: true }]
      ],
      plugins: [
        pluginCommonJs
      ],
      sourceMaps: false
    });

    fs.writeFileSync(outPath, result.code, 'utf8');
    compiledCount++;
  }
  console.log(`[compile-ts] Successfully compiled ${compiledCount} TypeScript files to dist/`);
}

compileAll();
