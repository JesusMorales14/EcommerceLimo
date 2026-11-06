import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { environment } from '@env/environment';
import { DEAL_POLL_INTERVAL_MS, DealsStore } from './deals.store';

const base = environment.apiUrl;
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();
const OFFERS = { items: [1, 2, 3, 4, 5].map((id) => ({ id, name: `P${id}` })), total: 5 };

@Component({ template: '', providers: [DealsStore] })
class Host {
  readonly store = inject(DealsStore);
}

describe('DealsStore', () => {
  let http: HttpTestingController;
  let store: DealsStore;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    store = TestBed.createComponent(Host).componentInstance.store;
    vi.advanceTimersByTime(0);
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('activa la sesión y carga como máximo 4 ofertas', () => {
    http.expectOne(`${base}/deal-sessions/active`).flush({ id: 1, startsAt: hoursFromNow(-1), endsAt: hoursFromNow(1) });
    http.expectOne((r) => r.urlWithParams.includes('isOffer=true')).flush(OFFERS);
    expect(store.isActive()).toBe(true);
    expect(store.offers()).toHaveLength(4);
  });

  it('muestra el teaser cuando solo hay una sesión programada', () => {
    http.expectOne(`${base}/deal-sessions/active`).flush(null);
    http.expectOne(`${base}/deal-sessions/scheduled`).flush({ id: 2, startsAt: hoursFromNow(2), endsAt: hoursFromNow(5) });
    expect(store.showTeaser()).toBe(true);
    expect(store.isActive()).toBe(false);
  });

  it('vuelve a consultar periódicamente mientras no haya sesión activa', () => {
    http.expectOne(`${base}/deal-sessions/active`).flush(null);
    http.expectOne(`${base}/deal-sessions/scheduled`).flush(null);
    vi.advanceTimersByTime(DEAL_POLL_INTERVAL_MS);
    http.expectOne(`${base}/deal-sessions/active`).flush(null);
    http.expectOne(`${base}/deal-sessions/scheduled`).flush(null);
  });
});
