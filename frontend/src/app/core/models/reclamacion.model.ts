export type ReclamacionTipo   = 'RECLAMO' | 'QUEJA';
export type ReclamacionBien   = 'PRODUCTO' | 'SERVICIO';
export type ReclamacionEstado = 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO' | 'CERRADO';

export interface Reclamacion {
  id:        number;
  nombre:    string;
  apellidos: string;
  dni:       string;
  email:     string;
  telefono:  string;
  direccion?: string;
  tipo:      ReclamacionTipo;
  bien:      ReclamacionBien;
  pedidoNum?: string;
  detalle:   string;
  accion?:   string;
  estado:    ReclamacionEstado;
  respuesta?: string;
  userId?:   number;
  user?:     { id: number; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export const ESTADO_LABELS: Record<ReclamacionEstado, string> = {
  PENDIENTE:   'Pendiente',
  EN_REVISION: 'En revisión',
  RESUELTO:    'Resuelto',
  CERRADO:     'Cerrado',
};

export const ESTADO_COLORS: Record<ReclamacionEstado, string> = {
  PENDIENTE:   '#f59e0b',
  EN_REVISION: '#3b82f6',
  RESUELTO:    '#22c55e',
  CERRADO:     '#94a3b8',
};

export const TIPO_LABELS: Record<ReclamacionTipo, string> = {
  RECLAMO: 'Reclamo',
  QUEJA:   'Queja',
};

export const TIPO_COLORS: Record<ReclamacionTipo, string> = {
  RECLAMO: '#ef4444',
  QUEJA:   '#8b5cf6',
};

export const ESTADO_ORDER: ReclamacionEstado[] = [
  'PENDIENTE', 'EN_REVISION', 'RESUELTO', 'CERRADO',
];
