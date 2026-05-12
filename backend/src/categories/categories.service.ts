import { Injectable } from '@nestjs/common';

export interface SubCategory { id: string; label: string; }
export interface Category { id: string; label: string; icon: string; subCategories: SubCategory[]; }

@Injectable()
export class CategoriesService {
  private categories: Category[] = [
    {
      id: 'electrodomesticos', label: 'Electrodomésticos', icon: 'kitchen',
      subCategories: [
        { id: 'refrigeradores', label: 'Refrigeradores' },
        { id: 'lavadoras',      label: 'Lavadoras'      },
        { id: 'cocinas',        label: 'Cocinas'        },
        { id: 'microondas',     label: 'Microondas'     },
      ],
    },
    {
      id: 'tecnologia', label: 'Tecnología', icon: 'devices',
      subCategories: [
        { id: 'smartphones',  label: 'Smartphones'  },
        { id: 'laptops',      label: 'Laptops y PCs' },
        { id: 'consolas',     label: 'Consolas'     },
        { id: 'audio',        label: 'Audio'        },
        { id: 'televisores',  label: 'Televisores'  },
      ],
    },
    {
      id: 'moda-mujer', label: 'Moda Mujer', icon: 'woman',
      subCategories: [
        { id: 'vestidos',    label: 'Vestidos'    },
        { id: 'blusas',      label: 'Blusas y Tops' },
        { id: 'jeans',       label: 'Jeans'       },
        { id: 'calzado',     label: 'Calzado'     },
      ],
    },
    {
      id: 'moda-hombre', label: 'Moda Hombre', icon: 'man',
      subCategories: [
        { id: 'camisas',     label: 'Camisas y Polos' },
        { id: 'pantalones',  label: 'Pantalones'      },
        { id: 'calzado',     label: 'Calzado'         },
        { id: 'accesorios',  label: 'Accesorios'      },
      ],
    },
    {
      id: 'hogar', label: 'Hogar & Deco', icon: 'weekend',
      subCategories: [
        { id: 'muebles',     label: 'Muebles'     },
        { id: 'iluminacion', label: 'Iluminación' },
        { id: 'decoracion',  label: 'Decoración'  },
        { id: 'textiles',    label: 'Textiles'    },
      ],
    },
    {
      id: 'deporte', label: 'Deporte & Fitness', icon: 'fitness_center',
      subCategories: [
        { id: 'ropa-deportiva', label: 'Ropa Deportiva' },
        { id: 'gimnasio',       label: 'Gimnasio'       },
        { id: 'outdoor',        label: 'Outdoor'        },
        { id: 'bicicletas',     label: 'Bicicletas'     },
      ],
    },
    {
      id: 'belleza', label: 'Belleza & Salud', icon: 'face',
      subCategories: [
        { id: 'maquillaje', label: 'Maquillaje' },
        { id: 'skincare',   label: 'Cuidado Facial' },
        { id: 'perfumes',   label: 'Perfumes'   },
        { id: 'cabello',    label: 'Cabello'    },
      ],
    },
    {
      id: 'ofertas', label: 'Ofertas', icon: 'local_offer',
      subCategories: [],
    },
  ];

  findAll(): Category[] {
    return this.categories;
  }
}
