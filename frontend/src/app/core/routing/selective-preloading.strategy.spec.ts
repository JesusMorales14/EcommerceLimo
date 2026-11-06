import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, toArray } from 'rxjs';
import { SelectivePreloadingStrategy } from './selective-preloading.strategy';

describe('SelectivePreloadingStrategy', () => {
  let strategy: SelectivePreloadingStrategy;
  const load = () => of('cargado');

  beforeEach(() => {
    strategy = TestBed.inject(SelectivePreloadingStrategy);
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'connection');
  });

  it('precarga las rutas por defecto', async () => {
    await expect(firstValueFrom(strategy.preload({ path: 'x' }, load))).resolves.toBe('cargado');
  });

  it('omite las rutas marcadas con preload: false', async () => {
    const emitted = await firstValueFrom(strategy.preload({ path: 'admin', data: { preload: false } }, load).pipe(toArray()));
    expect(emitted).toEqual([]);
  });

  it('omite la precarga con ahorro de datos activado', async () => {
    Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true });
    const emitted = await firstValueFrom(strategy.preload({ path: 'x' }, load).pipe(toArray()));
    expect(emitted).toEqual([]);
  });
});
