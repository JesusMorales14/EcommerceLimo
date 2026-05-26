import { Injectable, isDevMode } from '@angular/core';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  debug(message: string, context?: unknown): void {
    if (isDevMode()) {
      console.warn(`[DEBUG] ${message}`, context ?? '');
    }
  }

  info(message: string, context?: unknown): void {
    if (isDevMode()) {
      console.warn(`[INFO] ${message}`, context ?? '');
    }
  }

  warn(message: string, context?: unknown): void {
    console.warn(`[WARN] ${message}`, context ?? '');
  }

  error(message: string, context?: unknown): void {
    console.error(`[ERROR] ${message}`, context ?? '');
    // In production, this is where you'd send to Sentry/Datadog/etc.
    // Example: Sentry.captureException(context);
  }

  log(level: LogLevel, message: string, context?: unknown): void {
    this[level](message, context);
  }
}
