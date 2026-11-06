import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { LegalSection } from '../../components/legal-layout/legal-layout';
import { LegalLayout } from '../../components/legal-layout/legal-layout';

const SECTIONS: readonly LegalSection[] = [
  { id: 'aceptacion', label: 'Aceptación' },
  { id: 'uso', label: 'Uso de la plataforma' },
  { id: 'cuenta', label: 'Cuenta de usuario' },
  { id: 'compras', label: 'Compras y pagos' },
  { id: 'envios', label: 'Envíos y entregas' },
  { id: 'devoluciones', label: 'Devoluciones' },
  { id: 'propiedad', label: 'Propiedad intelectual' },
  { id: 'responsabilidad', label: 'Limitación de responsabilidad' },
  { id: 'modificaciones', label: 'Modificaciones' },
  { id: 'contacto', label: 'Contacto' },
];

/** Términos y Condiciones. */
@Component({
  selector: 'app-terminos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LegalLayout],
  templateUrl: './terminos.html',
  styleUrl: './terminos.scss',
})
export class TerminosPage {
  protected readonly sections = SECTIONS;
}
