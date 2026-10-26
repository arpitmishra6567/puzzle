/**
 * PUZZLED — Unified Puzzle Engine Registry (All 13 Playable Engines)
 * Includes the 11 Active Daily Catalog Engines + 2 Classic Vault Engines.
 */

import { CategoryId, PuzzleEngine } from '../types/puzzle';
import { NeonEngine } from './neon';
import { CurrentsEngine } from './currents';
import { SnippetsEngine } from './snippets';
import { WordsmithEngine } from './wordsmith';
import { StarstruckEngine } from './starstruck';
import { BonzaEngine } from './bonza';
import { WaywordsEngine } from './waywords';
import { CrossoverEngine } from './crossover';
import { JigsawEngine } from './jigsaw';
import { ComboEngine } from './combo';
import { SudokuEngine } from './sudoku';
import { ShapesEngine } from './shapes';
import { KeysmashEngine } from './keysmash';

export const ENGINE_REGISTRY: Record<CategoryId, PuzzleEngine<any, any, any>> = {
  neon: NeonEngine,
  currents: CurrentsEngine,
  snippets: SnippetsEngine,
  wordsmith: WordsmithEngine,
  starstruck: StarstruckEngine,
  bonza: BonzaEngine,
  waywords: WaywordsEngine,
  crossover: CrossoverEngine,
  jigsaw: JigsawEngine,
  combo: ComboEngine,
  sudoku: SudokuEngine,
  shapes: ShapesEngine,
  keysmash: KeysmashEngine
};

export function getEngine(categoryId: CategoryId): PuzzleEngine<any, any, any> {
  return ENGINE_REGISTRY[categoryId];
}

export * from './neon';
export * from './currents';
export * from './snippets';
export * from './wordsmith';
export * from './starstruck';
export * from './bonza';
export * from './waywords';
export * from './crossover';
export * from './jigsaw';
export * from './combo';
export * from './sudoku';
export * from './shapes';
export * from './keysmash';
