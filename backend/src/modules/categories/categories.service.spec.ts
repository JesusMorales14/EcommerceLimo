import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesService / Controller', () => {
  const service = new CategoriesService();

  it('devuelve las categorías con ids únicos y subcategorías', () => {
    const categories = service.findAll();
    expect(categories.length).toBeGreaterThan(0);
    expect(new Set(categories.map((c) => c.id)).size).toBe(categories.length);
    expect(
      categories.find((c) => c.id === 'tecnologia')?.subCategories.length,
    ).toBeGreaterThan(0);
  });

  it('el controlador delega en el servicio', () => {
    expect(new CategoriesController(service).findAll()).toBe(service.findAll());
  });
});
