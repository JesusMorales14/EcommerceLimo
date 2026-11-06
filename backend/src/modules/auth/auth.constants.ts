export const MIN_PASSWORD_LENGTH = 6;
/** bcrypt solo considera los primeros 72 bytes. */
export const MAX_PASSWORD_LENGTH = 72;
export const BCRYPT_SALT_ROUNDS = 10;

/** Límite de intentos de login/registro por minuto y por IP (fuerza bruta). */
export const AUTH_THROTTLE = { default: { limit: 10, ttl: 60_000 } };
