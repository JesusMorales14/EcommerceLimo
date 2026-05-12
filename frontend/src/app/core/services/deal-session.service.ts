import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface DealSession {
  id: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class DealSessionService {
  private api = inject(ApiService);

  getActive() {
    return this.api.get<DealSession | null>('/deal-sessions/active');
  }

  getScheduled() {
    return this.api.get<DealSession | null>('/deal-sessions/scheduled');
  }

  create(endsAt: Date, startsAt?: Date) {
    return this.api.post<DealSession>('/deal-sessions', {
      endsAt: endsAt.toISOString(),
      ...(startsAt ? { startsAt: startsAt.toISOString() } : {}),
    });
  }

  cancel() {
    return this.api.delete<{ ok: boolean }>('/deal-sessions/active');
  }
}
