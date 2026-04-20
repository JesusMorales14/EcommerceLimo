import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  private categories = [
    { id: 1, name: 'Consolas' },
    { id: 2, name: 'Laptops' },
    { id: 3, name: 'Smartphones' },
  ];

  findAll() {
    return this.categories;
  }
}
