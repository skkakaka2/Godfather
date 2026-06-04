import {shiftDate} from './format';

describe('shiftDate', () => {
  it('moves to the next local calendar day', () => {
    expect(shiftDate('2026-05-22', 1)).toBe('2026-05-23');
  });

  it('moves to the previous local calendar day', () => {
    expect(shiftDate('2026-05-22', -1)).toBe('2026-05-21');
  });

  it('handles month boundaries', () => {
    expect(shiftDate('2026-06-01', -1)).toBe('2026-05-31');
  });
});
