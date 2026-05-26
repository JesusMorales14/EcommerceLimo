export const SITE_CONFIG = {
  storeName: 'EcommerceLimo',

  installments: {
    count: 12,
    cardName: 'GreenCard',
  },

  delivery: [
    {
      icon: 'local_shipping',
      title: 'Despacho a domicilio',
      subtitle: 'Llega en 24 a 48 horas hábiles',
      badge: 'Gratis',
    },
    {
      icon: 'store',
      title: 'Retiro en tienda',
      subtitle: 'Disponible en 2 horas · EcommerceLimo Central',
      badge: 'Gratis',
    },
  ],

  trust: [
    { icon: 'verified_user', label: 'Compra segura' },
    { icon: 'replay', label: 'Devolución gratis' },
    { icon: 'workspace_premium', label: 'Garantía 1 año' },
  ],
} as const;
