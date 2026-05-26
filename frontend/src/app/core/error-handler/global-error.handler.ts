import { ErrorHandler, inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);
  private zone   = inject(NgZone);
  private router = inject(Router);

  handleError(error: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.logger.error('Error no manejado', { message: err.message, stack: err.stack });

    // Chunk load errors indicate a new deploy — navigate to reload the app cleanly
    if (err.message?.includes('ChunkLoadError') || err.message?.includes('Loading chunk')) {
      this.zone.run(() => void this.router.navigate(['/']));
    }
  }
}
