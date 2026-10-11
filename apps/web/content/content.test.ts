import { describe, it, expect } from 'vitest';
import { STRINGS } from './strings';

const BANNED_PHRASES = [
  'unlock',
  'supercharge',
  'seamless',
  'empower',
  'leverage',
  'revolutionize',
  'insights at your fingertips',
  'dive in',
];

function extractAllStrings(obj: any): string[] {
  const result: string[] = [];
  function recurse(current: any) {
    if (typeof current === 'string') {
      result.push(current);
    } else if (typeof current === 'object' && current !== null) {
      for (const val of Object.values(current)) {
        recurse(val);
      }
    }
  }
  recurse(obj);
  return result;
}

describe('Content Copy Guidelines Compliance', () => {
  const allStrings = extractAllStrings(STRINGS);

  it('contains no banned marketing or AI fluff phrases', () => {
    for (const text of allStrings) {
      const lower = text.toLowerCase();
      for (const banned of BANNED_PHRASES) {
        expect(
          lower.includes(banned),
          `Found banned phrase "${banned}" in content string: "${text}"`
        ).toBe(false);
      }
    }
  });

  it('contains no exclamation marks (ensuring calm, professional tone)', () => {
    for (const text of allStrings) {
      expect(
        text.includes('!'),
        `Found exclamation mark in content string: "${text}"`
      ).toBe(false);
    }
  });

  it('verifies non-empty copy keys', () => {
    expect(allStrings.length).toBeGreaterThan(30);
    for (const text of allStrings) {
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });
});
