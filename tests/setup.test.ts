import { describe, it, expect } from 'vitest';
import { VERSION } from '../src/index';
import process from 'node:process';

describe('Fase 0: Setup Verification', () => {
  it('should run test environment', () => {
    expect(true).toBe(true);
  });

  it('should export VERSION', () => {
    expect(VERSION).toBe('0.1.0');
  });

  it('should have Node.js version >= 18', () => {
    const nodeVersion = parseInt(process.versions.node.split('.')[0], 10);
    expect(nodeVersion).toBeGreaterThanOrEqual(18);
  });
});
