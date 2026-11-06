import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { SupportTopic } from '../../chat-support.data';

/** Bienvenida y listado de temas del asistente. */
@Component({
  selector: 'app-chat-topic-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-topic-list.html',
  styleUrl: './chat-topic-list.scss',
})
export class ChatTopicList {
  readonly topics = input.required<readonly SupportTopic[]>();
  readonly selected = output<SupportTopic>();
}
