/** Enlaces de navegación secundaria compartidos por el footer y el menú móvil. */
export interface NavLink {
  readonly label: string;
  readonly path: string;
}

export interface NavLinkGroup {
  readonly title: string;
  readonly links: readonly NavLink[];
}

export type SocialNetwork = 'facebook' | 'instagram' | 'tiktok' | 'whatsapp';

export interface SocialLink {
  readonly network: SocialNetwork;
  readonly label: string;
  readonly url: string;
}

export const FOOTER_LINK_GROUPS: readonly NavLinkGroup[] = [
  {
    title: 'Atención al cliente',
    links: [
      { label: 'Centro de Ayuda', path: '/centro-ayuda' },
      { label: 'Política de Envío', path: '/politica-envio' },
    ],
  },
  {
    title: 'Nosotros',
    links: [
      { label: 'Términos y Condiciones', path: '/terminos' },
      { label: 'Política de Privacidad', path: '/privacidad' },
      { label: 'Libro de Reclamaciones', path: '/reclamaciones' },
    ],
  },
];

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { network: 'facebook', label: 'Facebook', url: 'https://www.facebook.com' },
  { network: 'instagram', label: 'Instagram', url: 'https://www.instagram.com' },
  { network: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com' },
  { network: 'whatsapp', label: 'WhatsApp', url: 'https://www.whatsapp.com' },
];
