const BRAND_COLOR = '#006b2d';
const MUTED_COLOR = '#64748b';

/** Envoltorio HTML común de los correos (estilos inline por compatibilidad con clientes de correo). */
export function emailLayout(
  content: string,
  footer = 'Gracias por confiar en EcommerceLimo.',
): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:${BRAND_COLOR};margin:0 0 16px">EcommerceLimo</h2>
      ${content}
      <p style="color:${MUTED_COLOR};font-size:12px;margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px">
        ${footer}
      </p>
    </div>`;
}

export const styles = {
  brand: BRAND_COLOR,
  muted: MUTED_COLOR,
  box: 'background:#f4f7f4;padding:12px;border-radius:8px;margin:8px 0',
  cell: 'padding:6px 0;color:#64748b',
} as const;
