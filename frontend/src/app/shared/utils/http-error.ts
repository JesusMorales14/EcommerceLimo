import type { HttpErrorResponse } from '@angular/common/http';

const DEFAULT_OFFLINE_MESSAGE = 'No se pudo conectar al servidor. Verifica tu conexión e intenta nuevamente.';

/**
 * Obtiene un mensaje legible a partir de un error HTTP del backend.
 * NestJS devuelve `message` como string o como arreglo (errores de validación).
 */
export function extractErrorMessage(
  error: Pick<HttpErrorResponse, 'status' | 'error'>,
  fallback: string,
  offlineMessage = DEFAULT_OFFLINE_MESSAGE,
): string {
  if (error.status === 0) return offlineMessage;
  const message: unknown = (error.error as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join('. ');
  return typeof message === 'string' && message ? message : fallback;
}
