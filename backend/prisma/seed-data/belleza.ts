import { mk, BLK } from './helpers';

const maqui = mk('belleza', 'maquillaje');
const skin  = mk('belleza', 'skincare');
const perfu = mk('belleza', 'perfumes');
const cabel = mk('belleza', 'cabello');

export const belleza = [
  maqui('Maybelline Fit Me! Base Líquida 30ml', 'Maybelline', 25, 40,
    'Base de maquillaje líquida con cobertura media-total, control de brillo y acabado mate natural. 30 tonos.', [], ['30ml']),
  maqui('Urban Decay Paleta Naked 3', 'Urban Decay', 59, 15,
    'Paleta de 12 sombras rosas y cobrizos de alta pigmentación, acabados mate y shimmer con espejo.'),
  maqui("L'Oréal Máscara de Pestañas Drama", "L'Oréal", 22, 35,
    'Máscara de pestañas con fórmula de fibras, cepillo voluminizador, efecto 10x más volumen.', [BLK]),
  maqui('Charlotte Tilbury Labial Matte', 'Charlotte Tilbury', 45, 20,
    'Labial matte de larga duración con fórmula hidratante, acabado aterciopelado y 40 tonos disponibles.', [], [], 15),
  maqui('Too Faced Iluminador Liquid Fairy', 'Too Faced', 49, 18,
    'Iluminador líquido buildable con pigmentos de cuarzo rosa, acabado cristalino y fórmula antienvejecimiento.'),
  maqui('Maybelline Corrector Instant Age', 'Maybelline', 28, 30,
    'Corrector de cobertura total con vitamina E, aplicador de microcepillo y fórmula antiojeras.'),

  skin('The Ordinary Sérum Vitamina C 10%', 'The Ordinary', 19, 50,
    'Sérum con ácido ascórbico al 10%, niacinamida y ácido hialurónico para piel luminosa y uniforme.', [], ['30ml']),
  skin('Neutrogena Crema Hydro Boost', 'Neutrogena', 29, 40,
    'Crema gel ultra hidratante con ácido hialurónico, absorción rápida y piel hidratada 72h.', [], ['50ml']),
  skin('La Roche-Posay Protector Solar SPF 50', 'La Roche-Posay', 32, 35,
    'Protector solar SPF 50+ ultra ligero no comedogénico, apto piel sensible, sin perfume y fórmula fluida.', [], ['50ml'], 10),
  skin('The Ordinary Ácido Hialurónico 2%+B5', 'The Ordinary', 16, 60,
    'Suero de ácido hialurónico de 3 pesos moleculares + vitamina B5 para hidratación profunda y superficial.', [], ['30ml']),
  skin('CeraVe Crema Retinol 0.5% 50ml', 'CeraVe', 35, 25,
    'Crema de retinol 0.5% con 3 ceramidas esenciales, niacinamida y ácido hialurónico. Piel renovada.', [], ['50ml']),
  skin('Bioderma Sérum Sensibio H2O 200ml', 'Bioderma', 29, 30,
    'Agua micelar para piel sensible, limpieza desmaquillante suave, fórmula hipoalergénica y calmante.', [], ['200ml']),

  perfu('Carolina Herrera 212 NYC EDP 100ml', 'Carolina Herrera', 89, 12,
    'Fragancia unisex NYC con notas de magnolia, flor de calabaza y cedro. Icónico y cosmopolita.', [], ['50ml', '100ml']),
  perfu('Carolina Herrera Good Girl EDP 80ml', 'Carolina Herrera', 119, 8,
    'Fragancia femenina con notas de jazmín, cacao y vainilla. El frasco icónico con forma de stiletto.', [], ['50ml', '80ml']),
  perfu('Giorgio Armani Acqua di Giò 100ml', 'Giorgio Armani', 99, 10,
    'Fragancia masculina fresca con notas de mar, bergamota, jazmín marino y patchouli. Referente acuático.',
    [], ['50ml', '100ml'], 20),
  perfu('Lancôme La Vie est Belle EDP 75ml', 'Lancôme', 109, 9,
    'Fragancia femenina con notas de iris, praline y vainilla. La felicidad hecha perfume.', [], ['50ml', '75ml', '100ml']),
  perfu('Chanel Bleu de Chanel EDT 100ml', 'Chanel', 149, 6,
    'Eau de Toilette masculina con notas de limón, menta, incienso y labdano. Elegancia intemporal.', [], ['50ml', '100ml']),

  cabel('Kérastase Shampoo Nutritive 250ml', 'Kérastase', 39, 20,
    'Shampoo nutritivo para cabello seco con Irisome, lípidos nutritivos y proteínas reforzadoras.', [], ['250ml', '500ml']),
  cabel("L'Oréal Mascarilla Elvive Extraordinary", "L'Oréal", 18, 35,
    'Mascarilla hidratante con aceite extraordinario de 6 aceites florales preciosos. Cabello brillante.', [], ['300ml']),
  cabel('Moroccanoil Aceite de Argán 100ml', 'Moroccanoil', 45, 15,
    'Aceite de tratamiento con aceite de argán puro, argan y antioxidantes. Cabello suave y brillante.', [], ['100ml'], 15),
  cabel('GHD Plancha Cabello Platinum+ 230°C', 'GHD', 249, 7,
    'Plancha de cabello inteligente con tecnología tri-zone, 230°C, placas flotantes y apagado automático.', [BLK, '#c8a87a']),
  cabel('Remington Secadora Iónica 2200W', 'Remington', 79, 12,
    'Secadora iónica profesional 2200W con tecnología de cerámica, 3 velocidades, 2 temperaturas y difusor.', [BLK]),
];
