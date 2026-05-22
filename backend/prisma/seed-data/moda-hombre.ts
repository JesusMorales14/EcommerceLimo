import { mk, BLK, WHT, SLV } from './helpers';

const camis = mk('moda-hombre', 'camisas');
const panta = mk('moda-hombre', 'pantalones');
const calzH = mk('moda-hombre', 'calzado');
const acces = mk('moda-hombre', 'accesorios');

export const modaHombre = [
  camis('Tommy Hilfiger Camisa Oxford Slim Fit', 'Tommy Hilfiger', 79, 20,
    'Camisa Oxford de algodón slim fit con logo bordado, botones nácar y manga larga. Clásico moderno.',
    [WHT, '#5a7aaa', '#aa7a5a'], ['S', 'M', 'L', 'XL', 'XXL']),
  camis('Zara Man Camisa de Lino Casual', 'Zara Man', 49, 25,
    'Camisa de lino lavado con cuello mao, manga larga enrollable y fit regular. Fresca y versátil.',
    ['#f0e8d0', '#c8d0d8', '#5a8a5a'], ['S', 'M', 'L', 'XL', 'XXL']),
  camis('Lacoste Polo Clásico Piqué', 'Lacoste', 99, 18,
    'Polo clásico Lacoste en piqué de algodón con cocodrilo bordado, 3 botones y cuello de punto.',
    [WHT, BLK, '#2d5a2d', '#c81a1a'], ['S', 'M', 'L', 'XL', 'XXL'], 10),
  camis('Calvin Klein Camisa Formal Blanca', 'Calvin Klein', 69, 15,
    'Camisa formal de popelín blanco, slim fit, manga larga y botones de nácar. Perfecta para traje.',
    [WHT, '#c8d0d8'], ['S', 'M', 'L', 'XL']),
  camis('Nike Polera Manga Corta Dri-FIT', 'Nike', 39, 30,
    'Polera Dri-FIT de entrenamiento con tecnología de secado rápido, logo swoosh bordado y cuello redondo.',
    [BLK, WHT, '#2d5a8e'], ['S', 'M', 'L', 'XL', 'XXL']),

  panta('H&M Pantalón Chino Slim Stretch', 'H&M', 55, 20,
    'Pantalón chino slim con tela stretch, bolsillos laterales y traseros, y acabado liso.',
    ['#c8b89a', '#5a6a7a', BLK], ['28', '30', '32', '34', '36']),
  panta("Levi's Jeans Slim Fit 511", "Levi's", 89, 18,
    'Jeans 511 slim fit en denim stretch, corte ceñido desde cadera hasta tobillo, 5 bolsillos clásicos.',
    ['#2d4a6a', BLK, '#5a6a7a'], ['28', '30', '32', '34', '36', '38']),
  panta('Zara Man Pantalón de Vestir Moderno', 'Zara Man', 69, 14,
    'Pantalón de vestir de tela sin arrugas, slim fit, plisado frontal y cierre metálico.',
    [BLK, '#c8c0b0', '#5a4a3a'], ['28', '30', '32', '34', '36']),
  panta('Adidas Jogger de Algodón Essentials', 'Adidas', 45, 25,
    'Jogger de algodón Essentials con elástico en cintura y tobillo, dos bolsillos y fit regular.',
    [BLK, '#5a6a7a', '#2d5a2d'], ['S', 'M', 'L', 'XL', 'XXL']),

  calzH('Nike Air Force 1 Low Blancas', 'Nike', 99, 15,
    'Zapatillas Nike Air Force 1 Low con cuero genuino, unidad Air en talón y suela de goma perforada.',
    [WHT], ['40', '41', '42', '43', '44', '45']),
  calzH('Adidas Stan Smith Cuero', 'Adidas', 89, 18,
    'Zapatillas Stan Smith en cuero prensado con tres rayas perforadas y suela de goma. Ícono del tenis.',
    [WHT], ['40', '41', '42', '43', '44', '45'], 15),
  calzH('New Balance 574 Lifestyle', 'New Balance', 99, 12,
    'Zapatillas 574 con encaje ENCAP en mediasuela, capellada de cuero y malla. Comodidad todo el día.',
    ['#2d4a6a', '#5a6a5a', '#c81a1a'], ['40', '41', '42', '43', '44', '45']),
  calzH('Clarks Mocasín de Cuero Clásico', 'Clarks', 129, 8,
    'Mocasín de cuero genuino con plantilla OrthoLite, suela de cuero y acabado pulido. Elegante y cómodo.',
    ['#8a5a3a', BLK], ['40', '41', '42', '43', '44']),

  acces('Casio Reloj Edifice Acero Inoxidable', 'Casio', 129, 10,
    'Reloj Edifice de cuarzo con correa de acero, cronógrafo 1/20s, 10 ATM sumergible y fecha.', [SLV]),
  acces('Tommy Hilfiger Cinturón de Cuero', 'Tommy Hilfiger', 49, 20,
    'Cinturón de cuero genuino con hebilla de metal dorada y logo grabado. Corte clásico reversible.',
    [BLK, '#8a5a3a'], ['S', 'M', 'L', 'XL']),
  acces('Fossil Billetera Slim de Cuero RFID', 'Fossil', 59, 15,
    'Billetera slim con protección RFID, 6 ranuras para tarjetas, compartimento para billetes y cuero Derrick.',
    [BLK, '#8a5a3a']),
  acces('New Era Gorra 59FIFTY NFL Negra', 'New Era', 39, 25,
    'Gorra estructurada 59FIFTY con visera curva, bordado 3D del equipo y cierre trasero metálico.',
    [BLK, '#2d4a6a', '#c81a1a']),
];
