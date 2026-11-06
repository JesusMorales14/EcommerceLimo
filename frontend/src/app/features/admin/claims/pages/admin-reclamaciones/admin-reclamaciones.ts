import type { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import type { Reclamacion, ReclamacionFilter } from '@core/models/reclamacion.model';
import { countByEstado } from '@core/models/reclamacion.model';
import { ReclamacionService } from '@core/services/reclamacion.service';
import { extractErrorMessage } from '@shared/utils/http-error';
import { AdminClaimCard } from '../../components/admin-claim-card/admin-claim-card';
import type { ClaimResponse } from '../../components/claim-response-form/claim-response-form';
import { ClaimsFilterTabs } from '../../components/claims-filter-tabs/claims-filter-tabs';
import { ClaimsStats } from '../../components/claims-stats/claims-stats';

const TOAST_DURATION_MS = 3500;

/** Gestión del Libro de Reclamaciones por parte del administrador. */
@Component({
  selector: 'app-admin-reclamaciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ClaimsStats, ClaimsFilterTabs, AdminClaimCard],
  templateUrl: './admin-reclamaciones.html',
  styleUrl: './admin-reclamaciones.scss',
})
export class AdminReclamacionesPage {
  private readonly service = inject(ReclamacionService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly claimsResource = rxResource({ stream: () => this.service.getAll() });
  private readonly all = computed(() => (this.claimsResource.hasValue() ? this.claimsResource.value() : []));

  readonly filter = signal<ReclamacionFilter>('TODOS');
  protected readonly expandedId = signal<number | null>(null);
  protected readonly updatingId = signal<number | null>(null);
  protected readonly errorId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly toast = signal('');

  readonly counts = computed(() => countByEstado(this.all()));
  readonly filtered = computed(() => {
    const filter = this.filter();
    return filter === 'TODOS' ? this.all() : this.all().filter((claim) => claim.estado === filter);
  });

  protected toggle(id: number): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  protected save(claim: Reclamacion, { estado, respuesta }: ClaimResponse): void {
    this.updatingId.set(claim.id);
    this.errorId.set(null);
    this.service.updateEstado(claim.id, estado, respuesta).subscribe({
      next: (updated) => {
        this.claimsResource.update((list) => list?.map((c) => (c.id === claim.id ? { ...c, ...updated } : c)));
        this.updatingId.set(null);
        this.expandedId.set(null);
        this.showToast('Cambios guardados correctamente');
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(extractErrorMessage(err, 'Error al guardar. Inténtalo nuevamente.'));
        this.errorId.set(claim.id);
        this.updatingId.set(null);
      },
    });
  }

  private showToast(message: string): void {
    this.toast.set(message);
    const timeoutId = setTimeout(() => this.toast.set(''), TOAST_DURATION_MS);
    this.destroyRef.onDestroy(() => clearTimeout(timeoutId));
  }
}
