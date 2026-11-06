/** Tema de ayuda rápida del asistente de soporte. */
export interface SupportTopic {
  readonly id: string;
  readonly icon: string;
  readonly label: string;
  /** Respuesta; cada salto de línea se muestra como un párrafo. */
  readonly answer: string;
}

export const SUPPORT_EMAIL = 'soporte@ecommercelimo.com';
export const SUPPORT_WHATSAPP_URL = 'https://wa.me/51986123456';

export const SUPPORT_TOPICS: readonly SupportTopic[] = [
  {
    id: 'shipping',
    icon: 'local_shipping',
    label: 'Envíos',
    answer:
      'Hacemos envíos a todo el Perú.\n\n• Lima Metropolitana: 1 a 3 días hábiles.\n• Provincias: 3 a 7 días hábiles.\n• Los pedidos confirmados antes de las 2:00 p. m. se despachan el mismo día.',
  },
  {
    id: 'payments',
    icon: 'credit_card',
    label: 'Métodos de pago',
    answer:
      'Aceptamos los siguientes medios de pago:\n\n• Tarjetas de crédito/débito (Visa, Mastercard, Amex)\n• PayPal\n• Mercado Pago\n• Efectivo al recibir tu pedido',
  },
  {
    id: 'returns',
    icon: 'assignment_return',
    label: 'Devoluciones',
    answer:
      'Tienes 30 días desde la entrega para solicitar una devolución.\n\nRequisitos:\n• Producto en empaque original\n• Con todos sus accesorios\n• Sin daños por mal uso\n\nEscríbenos y coordinamos el retiro.',
  },
  {
    id: 'orders',
    icon: 'receipt_long',
    label: 'Mis pedidos',
    answer:
      'Puedes rastrear tu pedido en:\n→ Mi Cuenta > Mis Pedidos\n\nTambién recibirás actualizaciones por correo en cada etapa del envío.',
  },
  {
    id: 'warranty',
    icon: 'verified_user',
    label: 'Garantía',
    answer:
      'Todos nuestros productos tienen garantía mínima de 6 meses.\n\n• Electrónica: hasta 12 meses\n• Hogar y deco: 6 meses\n• Moda: cambio por defecto de fábrica\n\n¡Si tienes un problema, nos hacemos cargo!',
  },
  {
    id: 'contact',
    icon: 'support_agent',
    label: 'Contacto directo',
    answer:
      'Puedes contactarnos por:\n\n📱 WhatsApp: +51 986 123 456\n📧 Email: soporte@ecommercelimo.com\n\n🕐 Horario de atención:\nLun–Vie: 8 a. m. – 6 p. m.\nSáb: 9 a. m. – 1 p. m.',
  },
];
