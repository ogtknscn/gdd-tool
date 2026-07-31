/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
const sources = import.meta.glob('../src/**/*.{ts,tsx}', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
describe('native browser dialogs', () => { it('does not use blocking window dialog APIs', () => { const offenders = Object.entries(sources).filter(([, source]) => /window\.(confirm|alert|prompt)\s*\(/.test(source)).map(([path]) => path); expect(offenders).toEqual([]); }); });
