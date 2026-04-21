import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product, PRODUCTOS_MOCK } from '../../core/mocks/products.mock';
import { CartService } from '../../core/services/cart';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductListComponent implements OnInit {
  private cartService = inject(CartService);
  titulo: string = '';
  descripcion: string = '';
  breadcrumb: string = '';

  productosMostrados: Product[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const categoriaId = params['id'];
      const subId = params['subid'];
      this.actualizarContenido(categoriaId, subId);
    });
  }
  agregarAlCarrito(producto: Product) {
  console.log('Mi servicio es:', this.cartService); // Mira qué sale en la consola
  this.cartService.addToCart(producto);
}

actualizarContenido(id: string, subId?: string) {
  const diccionario: any = {
    'fashion': {
      t: 'Style & Trends',
      d: 'Discover the latest in clothing and accessories designed for the modern wardrobe.',
      b: 'HOME / FASHION',
      subcategorias: {
        'hombre': { t: 'Men\'s Collection', d: 'Premium tailoring and casual essentials for the modern man.' },
        'mujer': { t: 'Women\'s Edit', d: 'Contemporary silhouettes and timeless pieces for every occasion.' },
        'calzado': { t: 'Premium Footwear', d: 'From Italian leather boots to high-performance sneakers.' },
        'accesorios': { t: 'Curated Accessories', d: 'The finishing touches: belts, watches, and premium leather goods.' }
      }
    },
    'electronics': {
      t: 'Premium Devices',
      d: 'High-performance technology designed for the modern greenhouse of life.',
      b: 'HOME / ELECTRONICS',
      subcategorias: {
        'consolas': { t: 'Gaming & Consoles', d: 'Immersive entertainment systems and next-gen gaming gear.' },
        'laptops': { t: 'Laptops & Computing', d: 'Power and portability for professionals and creators.' },
        'audio': { t: 'Pro Audio & Sound', d: 'Studio-quality headphones and high-fidelity sound systems.' },
        'smartphones': { t: 'Smartphones', d: 'The latest flagship devices with cutting-edge camera technology.' }
      }
    },
    'home-decor': {
      t: 'Home Sanctuary',
      d: 'Transform your living space with our exclusive selection of furniture and decor.',
      b: 'HOME / HOME & DECOR',
      subcategorias: {
        'muebles': { t: 'Designer Furniture', d: 'Minimalist and functional pieces for every room in your home.' },
        'iluminacion': { t: 'Architectural Lighting', d: 'Illuminate your space with our curated collection of lamps and fixtures.' },
        'decoracion': { t: 'Art & Decoration', d: 'Small details that make a big difference in your sanctuary.' }
      }
    },
    'beauty': {
      t: 'Beauty & Wellness',
      d: 'Elevate your self-care routine with our premium selection of skincare and cosmetics.',
      b: 'HOME / BEAUTY',
      subcategorias: {
        'maquillaje': { t: 'Professional Makeup', d: 'High-pigment cosmetics for a flawless and lasting finish.' },
        'skincare': { t: 'Advanced Skincare', d: 'Dermatologist-tested formulas for healthy, radiant skin.' },
        'perfumes': { t: 'Signature Fragrances', d: 'Discover your new scent from the world’s most prestigious houses.' }
      }
    },
    'sports': {
      t: 'Active Performance',
      d: 'High-quality gear and apparel designed to push your physical limits.',
      b: 'HOME / SPORTS',
      subcategorias: {
        'ropa-deportiva': { t: 'Performance Apparel', d: 'Technical fabrics designed for comfort and durability during training.' },
        'maquinas-gym': { t: 'Home Gym Equipment', d: 'Professional-grade machinery to build your dream gym at home.' },
        'suplementos': { t: 'Nutrition & Health', d: 'Pure supplements to fuel your body and optimize recovery.' },
        'outdoor': { t: 'Outdoor & Adventure', d: 'Rugged gear for your next camping or hiking expedition.' }
      }
    },
    'offers': {
      t: 'Special Offers',
      d: 'Exclusive discounts on our most wanted products. Limited time only.',
      b: 'HOME / OFFERS'
    }
  };
  const categoriaBase = diccionario[id] || diccionario['electronics'];

  if (subId && categoriaBase.subcategorias && categoriaBase.subcategorias[subId]) {
    const subFormateada = subId.replace('-', ' ').toUpperCase();
    this.titulo = categoriaBase.subcategorias[subId]?.t || categoriaBase.t;
    this.descripcion = categoriaBase.subcategorias[subId]?.d || categoriaBase.d;
    this.breadcrumb = `${categoriaBase.b} / ${subFormateada}`;

    this.productosMostrados = PRODUCTOS_MOCK.filter(p =>
      p.category === id && p.subCategory === subId
    );

  } else {
    this.titulo = categoriaBase.t;
    this.descripcion = categoriaBase.d;
    this.breadcrumb = categoriaBase.b;
    this.productosMostrados = PRODUCTOS_MOCK.filter(p => p.category === id);
  }
  console.log(`Mostrando ${this.productosMostrados.length} productos de ${id} ${subId || ''}`);
}
}
