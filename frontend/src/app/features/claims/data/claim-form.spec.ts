import { FormBuilder } from '@angular/forms';
import { buildClaimForm, toClaimPayload } from './claim-form';

const VALID = {
  nombre: 'Ana', apellidos: 'Pérez', dni: '12345678', telefono: '+51 999 999 999', email: 'ana@test.com',
  detalle: 'El producto llegó dañado', acepta: true,
};

describe('claim-form', () => {
  const build = () => buildClaimForm(new FormBuilder());

  it('es inválido vacío y válido con los campos obligatorios', () => {
    const form = build();
    expect(form.valid).toBe(false);
    form.patchValue(VALID);
    expect(form.valid).toBe(true);
  });

  it.each([
    ['dni', '12ab', 'pattern'],
    ['email', 'correo-malo', 'email'],
    ['telefono', 'x', 'pattern'],
    ['detalle', 'corto', 'minlength'],
  ] as const)('valida %s', (field, value, errorKey) => {
    const form = build();
    form.patchValue({ ...VALID, [field]: value });
    expect(form.controls[field].hasError(errorKey)).toBe(true);
  });

  it('exige aceptar la declaración', () => {
    const form = build();
    form.patchValue({ ...VALID, acepta: false });
    expect(form.controls.acepta.hasError('required')).toBe(true);
  });

  it('toClaimPayload omite "acepta" y recorta los textos', () => {
    const form = build();
    form.patchValue({ ...VALID, nombre: '  Ana  ' });
    const payload = toClaimPayload(form);
    expect(payload).not.toHaveProperty('acepta');
    expect(payload.nombre).toBe('Ana');
    expect(payload.tipo).toBe('RECLAMO');
  });
});
