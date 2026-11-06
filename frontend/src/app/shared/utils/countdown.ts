import type { Signal } from '@angular/core';
import { computed, DestroyRef, effect, inject, signal, untracked } from '@angular/core';

const TICK_MS = 1000;
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

export interface TimeParts {
  readonly hours: string;
  readonly minutes: string;
  readonly seconds: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Descompone milisegundos en horas/minutos/segundos con dos dígitos. */
export function toTimeParts(ms: number): TimeParts {
  const safe = Math.max(0, ms);
  return {
    hours: pad(Math.floor(safe / MS_PER_HOUR)),
    minutes: pad(Math.floor((safe % MS_PER_HOUR) / MS_PER_MINUTE)),
    seconds: pad(Math.floor((safe % MS_PER_MINUTE) / MS_PER_SECOND)),
  };
}

/** Formatea milisegundos como `HH:MM:SS`. */
export function formatDuration(ms: number): string {
  const { hours, minutes, seconds } = toTimeParts(ms);
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Cuenta regresiva reactiva hacia `target`. Devuelve los milisegundos restantes
 * y ejecuta `onExpire` una vez al llegar a cero. Debe crearse en un contexto de
 * inyección; el intervalo se limpia automáticamente al destruirse.
 */
export function createCountdown(target: Signal<Date | null>, onExpire?: () => void): Signal<number> {
  const now = signal(Date.now());
  let intervalId: ReturnType<typeof setInterval> | undefined;
  const stop = () => {
    clearInterval(intervalId);
    intervalId = undefined;
  };

  effect(() => {
    const end = target();
    stop();
    if (!end) return;
    untracked(() => now.set(Date.now()));
    intervalId = setInterval(() => {
      now.set(Date.now());
      if (end.getTime() <= Date.now()) {
        stop();
        onExpire?.();
      }
    }, TICK_MS);
  });
  inject(DestroyRef).onDestroy(stop);

  return computed(() => {
    const end = target();
    return end ? Math.max(0, end.getTime() - now()) : 0;
  });
}
