import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { createCountdown, formatDuration, toTimeParts } from './countdown';

describe('countdown utils', () => {
  it('formatDuration y toTimeParts formatean con dos dígitos', () => {
    expect(formatDuration(3_723_000)).toBe('01:02:03');
    expect(toTimeParts(-5)).toEqual({ hours: '00', minutes: '00', seconds: '00' });
  });

  describe('createCountdown', () => {
    const target = signal<Date | null>(null);
    const onExpire = vi.fn();

    @Component({ template: '' })
    class Host {
      readonly remaining = createCountdown(target, onExpire);
    }

    beforeEach(() => {
      vi.useFakeTimers();
      onExpire.mockReset();
    });
    afterEach(() => vi.useRealTimers());

    it('descuenta cada segundo y notifica al expirar', () => {
      const fixture = TestBed.createComponent(Host);
      target.set(new Date(Date.now() + 3000));
      TestBed.tick();
      expect(fixture.componentInstance.remaining()).toBeGreaterThan(2000);

      vi.advanceTimersByTime(3000);
      expect(fixture.componentInstance.remaining()).toBe(0);
      expect(onExpire).toHaveBeenCalledTimes(1);
    });

    it('devuelve 0 si no hay objetivo', () => {
      target.set(null);
      const fixture = TestBed.createComponent(Host);
      TestBed.tick();
      expect(fixture.componentInstance.remaining()).toBe(0);
    });
  });
});
