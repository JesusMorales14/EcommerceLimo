import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Faq {
  id: string;
  icon: string;
  label: string;
  answer: string;
}

@Component({
  selector: 'app-chat-support',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-support.html',
  styleUrl: './chat-support.scss',
})
export class ChatSupport {
  isOpen     = signal(false);
  activeFaq  = signal<Faq | null>(null);

  faqs: Faq[] = [
    {
      id: 'shipping',
      icon: 'local_shipping',
      label: 'Envíos',
      answer: 'Hacemos envíos a toda Colombia.\n\n• Tiempo estimado: 3-5 días hábiles.\n• Envío gratis en pedidos mayores a S/ 50,000.\n• Lima: entrega en 1-2 días hábiles.',
    },
    {
      id: 'payments',
      icon: 'credit_card',
      label: 'Métodos de pago',
      answer: 'Aceptamos los siguientes medios de pago:\n\n• Tarjetas crédito/débito (Visa, Mastercard, Amex)\n• PSE\n• Nequi y Daviplata\n• Efectivo (Efecty, Baloto)\n• Pago contra entrega',
    },
    {
      id: 'returns',
      icon: 'assignment_return',
      label: 'Devoluciones',
      answer: 'Tienes 30 días desde la entrega para hacer una devolución sin costo.\n\nRequisitos:\n• Producto en empaque original\n• Con todos sus accesorios\n• Sin daños por mal uso\n\nEscríbenos y coordinamos el retiro.',
    },
    {
      id: 'orders',
      icon: 'receipt_long',
      label: 'Mis pedidos',
      answer: 'Puedes rastrear tu pedido en:\n→ Mi Cuenta > Mis Pedidos\n\nTambién recibirás actualizaciones por correo en cada etapa del envío.',
    },
    {
      id: 'warranty',
      icon: 'verified_user',
      label: 'Garantía',
      answer: 'Todos nuestros productos tienen garantía mínima de 6 meses.\n\n• Electrónica: hasta 12 meses\n• Hogar y deco: 6 meses\n• Moda: cambio por defecto de fábrica\n\n¡Si tienes un problema, nos hacemos cargo!',
    },
    {
      id: 'contact',
      icon: 'support_agent',
      label: 'Contacto directo',
      answer: 'Puedes contactarnos por:\n\n📱 WhatsApp: +57 300 000 0000\n📧 Email: soporte@ecommercelimo.com\n\n🕐 Horario de atención:\nLun–Vie: 8am – 6pm\nSáb: 9am – 1pm',
    },
  ];

  toggle() { this.isOpen.update(v => !v); if (!this.isOpen()) this.activeFaq.set(null); }
  close()  { this.isOpen.set(false); this.activeFaq.set(null); }
  select(faq: Faq) { this.activeFaq.set(faq); }
  back()   { this.activeFaq.set(null); }

  answerLines(answer: string): string[] {
    return answer.split('\n');
  }
}
