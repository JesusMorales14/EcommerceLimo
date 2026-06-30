import { Injectable } from '@nestjs/common';

export interface SubCategory {
  id: string;
  label: string;
}
export interface Category {
  id: string;
  label: string;
  icon: string;
  desc: string;
  subCategories: SubCategory[];
}

@Injectable()
export class CategoriesService {
  private categories: Category[] = [
    {
      id: 'electrodomesticos',
      label: 'Electrodomésticos',
      icon: 'kitchen',
      desc: 'Refrigeradoras, lavadoras, cocinas y más para tu hogar.',
      subCategories: [
        { id: 'refrigeradores', label: 'Refrigeradores' },
        { id: 'lavadoras', label: 'Lavadoras' },
        { id: 'cocinas', label: 'Cocinas' },
        { id: 'microondas', label: 'Microondas' },
      ],
    },
    {
      id: 'tecnologia',
      label: 'Tecnología',
      icon: 'devices',
      desc: 'Los mejores gadgets, electrónica y accesorios para tu vida digital.',
      subCategories: [
        { id: 'smartphones', label: 'Smartphones' },
        { id: 'laptops', label: 'Laptops y PCs' },
        { id: 'consolas', label: 'Consolas' },
        { id: 'audio', label: 'Audio' },
        { id: 'televisores', label: 'Televisores' },
      ],
    },
    {
      id: 'moda-mujer',
      label: 'Moda Mujer',
      icon: 'woman',
      desc: 'Descubre las últimas tendencias en moda femenina.',
      subCategories: [
        { id: 'vestidos', label: 'Vestidos' },
        { id: 'blusas', label: 'Blusas y Tops' },
        { id: 'jeans', label: 'Jeans' },
        { id: 'calzado', label: 'Calzado' },
      ],
    },
    {
      id: 'moda-hombre',
      label: 'Moda Hombre',
      icon: 'man',
      desc: 'Estilo y calidad para el hombre moderno.',
      subCategories: [
        { id: 'camisas', label: 'Camisas y Polos' },
        { id: 'pantalones', label: 'Pantalones' },
        { id: 'calzado', label: 'Calzado' },
        { id: 'accesorios', label: 'Accesorios' },
      ],
    },
    {
      id: 'hogar',
      label: 'Hogar & Deco',
      icon: 'weekend',
      desc: 'Piezas únicas para transformar tu espacio en algo especial.',
      subCategories: [
        { id: 'muebles', label: 'Muebles' },
        { id: 'iluminacion', label: 'Iluminación' },
        { id: 'decoracion', label: 'Decoración' },
        { id: 'textiles', label: 'Textiles' },
      ],
    },
    {
      id: 'deporte',
      label: 'Deporte & Fitness',
      icon: 'fitness_center',
      desc: 'Equipamiento profesional para cada disciplina deportiva.',
      subCategories: [
        { id: 'ropa-deportiva', label: 'Ropa Deportiva' },
        { id: 'gimnasio', label: 'Gimnasio' },
        { id: 'outdoor', label: 'Outdoor' },
        { id: 'bicicletas', label: 'Bicicletas' },
      ],
    },
    {
      id: 'belleza',
      label: 'Belleza & Salud',
      icon: 'face',
      desc: 'Productos de cuidado personal y belleza de las mejores marcas.',
      subCategories: [
        { id: 'maquillaje', label: 'Maquillaje' },
        { id: 'skincare', label: 'Cuidado Facial' },
        { id: 'perfumes', label: 'Perfumes' },
        { id: 'cabello', label: 'Cabello' },
      ],
    },
    {
      id: 'ofertas',
      label: 'Ofertas',
      icon: 'local_offer',
      desc: 'Los mejores descuentos en productos seleccionados.',
      subCategories: [],
    },
  ];

  findAll(): Category[] {
    return this.categories;
  }
}
