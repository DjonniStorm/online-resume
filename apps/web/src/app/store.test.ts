import { describe, expect, it } from 'vitest';

import { rootStore } from './store';

describe('rootStore', () => {
  it('creates a store instance', () => {
    expect(rootStore).toBeTypeOf('object');
  });
});
