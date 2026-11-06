import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ChatAnswer } from './components/chat-answer/chat-answer';
import { ChatTopicList } from './components/chat-topic-list/chat-topic-list';
import type { SupportTopic } from './chat-support.data';
import { SUPPORT_TOPICS } from './chat-support.data';

/** Asistente flotante de soporte con respuestas rápidas. */
@Component({
  selector: 'app-chat-support',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChatTopicList, ChatAnswer],
  templateUrl: './chat-support.html',
  styleUrl: './chat-support.scss',
  host: { '(document:keydown.escape)': 'close()' },
})
export class ChatSupport {
  readonly topics = SUPPORT_TOPICS;
  readonly isOpen = signal(false);
  readonly activeTopic = signal<SupportTopic | null>(null);

  toggle(): void {
    if (this.isOpen()) this.close();
    else this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.activeTopic.set(null);
  }
}
