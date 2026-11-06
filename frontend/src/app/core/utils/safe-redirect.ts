/**
 * Devuelve la ruta interna a la que redirigir tras autenticarse.
 * Evita redirecciones abiertas: solo acepta rutas relativas de la propia app.
 */
export function safeRedirect(candidate: unknown, fallback = '/'): string {
  if (typeof candidate !== 'string') return fallback;
  const isInternalPath = candidate.startsWith('/') && !candidate.startsWith('//') && !candidate.includes('\\');
  return isInternalPath ? candidate : fallback;
}
