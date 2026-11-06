import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Política de envíos (contenido estático). */
@Component({
  selector: 'app-politica-envio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './politica-envio.html',
  styleUrl: './politica-envio.scss',
})
export class PoliticaEnvioPage {}
