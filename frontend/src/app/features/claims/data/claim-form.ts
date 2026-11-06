import type { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import type { Reclamacion, ReclamacionBien, ReclamacionTipo } from '@core/models/reclamacion.model';
import type { ValidationMessages } from '@shared/components/field-error/field-error';

export const DNI_PATTERN = /^\d{7,12}$/;
export const PHONE_PATTERN = /^[\d\s+\-()]{7,15}$/;
export const MIN_DETAIL_LENGTH = 10;

export type ClaimForm = FormGroup<{
  tipo: FormControl<ReclamacionTipo>;
  nombre: FormControl<string>;
  apellidos: FormControl<string>;
  dni: FormControl<string>;
  telefono: FormControl<string>;
  email: FormControl<string>;
  direccion: FormControl<string>;
  bien: FormControl<ReclamacionBien>;
  pedidoNum: FormControl<string>;
  detalle: FormControl<string>;
  accion: FormControl<string>;
  acepta: FormControl<boolean>;
}>;

/** Construye el formulario reactivo del Libro de Reclamaciones con sus validaciones. */
export function buildClaimForm(fb: FormBuilder): ClaimForm {
  const required = Validators.required;
  return fb.nonNullable.group({
    tipo: fb.nonNullable.control<ReclamacionTipo>('RECLAMO'),
    nombre: ['', required],
    apellidos: ['', required],
    dni: ['', [required, Validators.pattern(DNI_PATTERN)]],
    telefono: ['', [required, Validators.pattern(PHONE_PATTERN)]],
    email: ['', [required, Validators.email]],
    direccion: [''],
    bien: fb.nonNullable.control<ReclamacionBien>('PRODUCTO'),
    pedidoNum: [''],
    detalle: ['', [required, Validators.minLength(MIN_DETAIL_LENGTH)]],
    accion: [''],
    acepta: [false, Validators.requiredTrue],
  });
}

/** Payload para la API: sin la casilla de aceptación y con textos recortados. */
export function toClaimPayload(form: ClaimForm): Partial<Reclamacion> {
  const { acepta: _accepted, ...values } = form.getRawValue();
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
  ) as Partial<Reclamacion>;
}

export const CLAIM_MESSAGES: Readonly<Record<string, ValidationMessages>> = {
  nombre: { required: 'El nombre es requerido.' },
  apellidos: { required: 'Los apellidos son requeridos.' },
  dni: { required: 'El DNI / CE es requerido.', pattern: 'Debe contener entre 7 y 12 dígitos numéricos.' },
  telefono: { required: 'El teléfono es requerido.', pattern: 'Ingresa un número de teléfono válido.' },
  email: { required: 'El correo electrónico es requerido.', email: 'Ingresa un correo electrónico válido.' },
  detalle: {
    required: 'La descripción es requerida.',
    minlength: `La descripción debe tener al menos ${MIN_DETAIL_LENGTH} caracteres.`,
  },
  acepta: { required: 'Debes aceptar la declaración para continuar.' },
};
