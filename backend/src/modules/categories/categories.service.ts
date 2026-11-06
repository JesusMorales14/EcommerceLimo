import { Injectable } from '@nestjs/common';
import { CATEGORIES, type Category } from './categories.data';

/** Expone el árbol de categorías del catálogo. */
@Injectable()
export class CategoriesService {
  findAll(): readonly Category[] {
    return CATEGORIES;
  }
}
