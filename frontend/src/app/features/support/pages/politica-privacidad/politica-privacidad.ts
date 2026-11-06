import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { LegalSection } from '../../components/legal-layout/legal-layout';
import { LegalLayout } from '../../components/legal-layout/legal-layout';

const SECTIONS: readonly LegalSection[] = [
  { id: 'responsable', label: 'Responsable del tratamiento' },
  { id: 'datos', label: 'Datos que recopilamos' },
  { id: 'finalidad', label: 'Finalidad del tratamiento' },
  { id: 'base', label: 'Base legal' },
  { id: 'conservacion', label: 'Conservación de datos' },
  { id: 'derechos', label: 'Derechos ARCO' },
  { id: 'terceros', label: 'Compartir con terceros' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'contacto', label: 'Contacto' },
];

/** Política de Privacidad. */
@Component({
  selector: 'app-politica-privacidad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LegalLayout],
  templateUrl: './politica-privacidad.html',
  styleUrl: './politica-privacidad.scss',
})
export class PoliticaPrivacidadPage {
  protected readonly sections = SECTIONS;
}
