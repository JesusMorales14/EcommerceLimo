import { signal } from '@angular/core';
import { buildPageWindow, createClientPagination } from './pagination';

describe('pagination utils', () => {
  describe('buildPageWindow', () => {
    it('devuelve todas las páginas cuando son pocas', () => {
      expect(buildPageWindow(1, 3)).toEqual([1, 2, 3]);
    });

    it('inserta elipsis alrededor de la página actual', () => {
      expect(buildPageWindow(6, 12)).toEqual([1, 'ellipsis', 5, 6, 7, 'ellipsis', 12]);
    });

    it('maneja los extremos', () => {
      expect(buildPageWindow(1, 10)).toEqual([1, 2, 'ellipsis', 10]);
      expect(buildPageWindow(10, 10)).toEqual([1, 'ellipsis', 9, 10]);
      expect(buildPageWindow(1, 0)).toEqual([]);
    });
  });

  describe('createClientPagination', () => {
    it('pagina la fuente y navega entre páginas válidas', () => {
      const source = signal([1, 2, 3, 4, 5]);
      const pager = createClientPagination(source, 2);
      expect(pager.totalPages()).toBe(3);
      expect(pager.items()).toEqual([1, 2]);

      pager.goTo(3);
      expect(pager.items()).toEqual([5]);
      pager.goTo(99);
      expect(pager.page()).toBe(3);
    });

    it('ajusta la página si la fuente se reduce', () => {
      const source = signal([1, 2, 3, 4, 5]);
      const pager = createClientPagination(source, 2);
      pager.goTo(3);
      source.set([1, 2]);
      expect(pager.page()).toBe(1);
      expect(pager.items()).toEqual([1, 2]);
    });
  });
});
