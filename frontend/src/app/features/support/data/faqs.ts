export type FaqCategoryId = 'todos' | 'pedidos' | 'pagos' | 'envios' | 'devoluciones';

export interface FaqCategory {
  readonly id: FaqCategoryId;
  readonly label: string;
  readonly icon: string;
}

export interface Faq {
  readonly id: number;
  readonly category: Exclude<FaqCategoryId, 'todos'>;
  readonly question: string;
  readonly answer: string;
}

export const FAQ_CATEGORIES: readonly FaqCategory[] = [
  { id: 'todos', label: 'Todos', icon: 'apps' },
  { id: 'pedidos', label: 'Pedidos', icon: 'shopping_bag' },
  { id: 'pagos', label: 'Pagos', icon: 'credit_card' },
  { id: 'envios', label: 'Envíos', icon: 'local_shipping' },
  { id: 'devoluciones', label: 'Devoluciones', icon: 'assignment_return' },
];

export const FAQS: readonly Faq[] = [
  {
    id: 1,
    category: 'pedidos',
    question: '¿Cómo realizo un pedido?',
    answer:
      'Navega por nuestro catálogo, selecciona el producto que deseas y haz clic en "Agregar al carrito". Luego dirígete a tu carrito y sigue los pasos para completar tu compra ingresando tus datos de envío y método de pago.',
  },
  {
    id: 2,
    category: 'pedidos',
    question: '¿Puedo cancelar o modificar mi pedido?',
    answer:
      'Puedes cancelar o modificar tu pedido dentro de las primeras 2 horas después de realizarlo. Después de ese tiempo, el pedido entra en proceso de preparación y ya no es posible modificarlo. Contáctanos de inmediato si necesitas hacer algún cambio.',
  },
  {
    id: 3,
    category: 'pedidos',
    question: '¿Cómo veo el estado de mi pedido?',
    answer:
      'Inicia sesión en tu cuenta y ve a "Mis Pedidos". Tu pedido puede estar en uno de estos estados: Pendiente (verificando pago), En proceso (preparando el pedido), En camino (con el operador logístico), Listo para retiro (disponible en el punto de entrega), Entregado o Cancelado. Recibirás un correo en cada cambio de estado.',
  },
  {
    id: 4,
    category: 'pagos',
    question: '¿Qué métodos de pago aceptan?',
    answer:
      'Aceptamos tarjetas de crédito y débito (Visa, Mastercard), pagos con Yape, Plin y transferencias bancarias. Todos los pagos son procesados de forma segura mediante encriptación SSL de 256 bits.',
  },
  {
    id: 5,
    category: 'pagos',
    question: '¿Es seguro pagar en su página?',
    answer:
      'Sí, absolutamente. Utilizamos protocolos de seguridad SSL y nuestros pagos con tarjeta son procesados por Stripe, uno de los proveedores de pagos más seguros del mundo. No almacenamos los datos de tu tarjeta en nuestros servidores.',
  },
  {
    id: 6,
    category: 'pagos',
    question: '¿Puedo pagar contra entrega?',
    answer:
      'Por el momento no ofrecemos pago contra entrega. Todos los pagos deben realizarse en línea al momento de confirmar el pedido. Esto nos permite procesar y enviar tu pedido más rápidamente.',
  },
  {
    id: 7,
    category: 'envios',
    question: '¿Cuánto tiempo tarda el envío?',
    answer:
      'Los envíos dentro de Lima Metropolitana tardan entre 1-3 días hábiles. Para provincias, el tiempo es de 3-7 días hábiles dependiendo de la ubicación. Los pedidos realizados antes de las 2:00 PM se despachan el mismo día.',
  },
  {
    id: 8,
    category: 'envios',
    question: '¿Realizan envíos a provincias?',
    answer:
      'Sí, enviamos a todo el Perú a través de Olva Courier y Shalom Express. Los tiempos y costos varían según la ciudad de destino. Durante el proceso de compra podrás ver el costo de envío exacto para tu ubicación.',
  },
  {
    id: 9,
    category: 'envios',
    question: '¿Cuánto cuesta el envío?',
    answer:
      'El costo de envío dentro de Lima Metropolitana tiene un valor base de S/ 8.90. Los envíos son gratuitos en compras mayores a S/ 150. Para provincias, el costo se calcula automáticamente al ingresar tu dirección de entrega.',
  },
  {
    id: 10,
    category: 'devoluciones',
    question: '¿Cuál es la política de devoluciones?',
    answer:
      'Aceptamos devoluciones dentro de los 30 días posteriores a la recepción del producto. El artículo debe estar en su estado original, sin usar y con todos sus empaques y etiquetas. Los gastos de envío de la devolución corren por cuenta del cliente salvo que el producto sea defectuoso.',
  },
  {
    id: 11,
    category: 'devoluciones',
    question: '¿Cómo solicito una devolución?',
    answer:
      'Para solicitar una devolución, ingresa a tu cuenta, ve a "Mis Pedidos", selecciona el pedido y haz clic en "Solicitar devolución". Completa el formulario indicando el motivo. Nuestro equipo revisará tu solicitud en un plazo de 24-48 horas hábiles.',
  },
  {
    id: 12,
    category: 'devoluciones',
    question: '¿Cuándo recibo el reembolso?',
    answer:
      'Una vez aprobada la devolución y recibido el producto en nuestras instalaciones, procesamos el reembolso en un plazo de 5-10 días hábiles. El tiempo que tarde en reflejarse en tu cuenta depende de tu banco o entidad financiera.',
  },
];
