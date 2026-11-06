import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';
import { filter, interval, startWith, switchMap, tap } from 'rxjs';
import type { Product } from '@core/models/product.model';
import type { DealSession } from '@core/services/deal-session.service';
import { DealSessionService } from '@core/services/deal-session.service';
import { ProductService } from '@core/services/product.service';
import { createCountdown } from '@shared/utils/countdown';

/** Cada cuánto se consulta si hay una sesión de ofertas activa. */
export const DEAL_POLL_INTERVAL_MS = 30_000;
const OFFERS_SHOWN = 4;

/**
 * Estado de las "Ofertas del Día" del inicio: sesión activa (con cuenta
 * regresiva y productos) o sesión programada (teaser). Consulta periódicamente
 * mientras no haya una sesión activa.
 */
@Injectable()
export class DealsStore {
  private readonly sessions = inject(DealSessionService);
  private readonly products = inject(ProductService);

  readonly activeSession = signal<DealSession | null>(null);
  readonly scheduledSession = signal<DealSession | null>(null);
  readonly offers = signal<Product[]>([]);

  readonly isActive = computed(() => this.activeSession() !== null);
  readonly showTeaser = computed(() => !this.isActive() && this.scheduledSession() !== null);

  /** Milisegundos para que termine la sesión activa. */
  readonly remaining = createCountdown(
    computed(() => this.toDate(this.activeSession()?.endsAt)),
    () => this.activeSession.set(null),
  );

  /** Milisegundos para que empiece la sesión programada. */
  readonly untilStart = createCountdown(
    computed(() => this.toDate(this.scheduledSession()?.startsAt)),
    () => this.refresh().subscribe(),
  );

  constructor() {
    interval(DEAL_POLL_INTERVAL_MS)
      .pipe(
        startWith(0),
        filter(() => !this.isActive()),
        switchMap(() => this.refresh()),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  /** Consulta la sesión activa; si no existe, la programada. */
  private refresh(): Observable<unknown> {
    return this.sessions.getActive().pipe(
      switchMap((active) => (active ? this.activate(active) : this.loadScheduled())),
    );
  }

  private activate(session: DealSession): Observable<unknown> {
    this.scheduledSession.set(null);
    this.activeSession.set(session);
    return this.products.getOffers().pipe(tap((page) => this.offers.set(page.items.slice(0, OFFERS_SHOWN))));
  }

  private loadScheduled(): Observable<unknown> {
    return this.sessions.getScheduled().pipe(tap((scheduled) => this.scheduledSession.set(scheduled ?? null)));
  }

  private toDate(iso?: string): Date | null {
    return iso ? new Date(iso) : null;
  }
}
