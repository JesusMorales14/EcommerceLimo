import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { SupportTopic } from '../../chat-support.data';
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP_URL } from '../../chat-support.data';

/** Respuesta a un tema de ayuda con accesos de contacto. */
@Component({
  selector: 'app-chat-answer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-answer.html',
  styleUrl: './chat-answer.scss',
})
export class ChatAnswer {
  readonly topic = input.required<SupportTopic>();
  readonly back = output<void>();

  protected readonly lines = computed(() => this.topic().answer.split('\n'));
  protected readonly emailHref = `mailto:${SUPPORT_EMAIL}`;
  protected readonly whatsappUrl = SUPPORT_WHATSAPP_URL;
}
