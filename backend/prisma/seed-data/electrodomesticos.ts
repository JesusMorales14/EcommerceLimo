import { mk, BLK, WHT, SLV } from './helpers';

const refri = mk('electrodomesticos', 'refrigeradores');
const lavad = mk('electrodomesticos', 'lavadoras');
const cocin = mk('electrodomesticos', 'cocinas');
const micro = mk('electrodomesticos', 'microondas');

export const electrodomesticos = [
  refri('Samsung Refrigerador French Door 520L', 'Samsung', 899, 8,
    'Refrigerador French Door con dispensador de agua y hielo, tecnología Twin Cooling Plus y 520 litros de capacidad.', [SLV]),
  refri('LG Refrigerador Side by Side 600L', 'LG', 1199, 5,
    'Refrigerador Side by Side con 600L, InstaView Door-in-Door, tecnología LinearCooling y conectividad ThinQ.', [BLK]),
  refri('Mabe Refrigerador No Frost 360L', 'Mabe', 499, 12,
    'Refrigerador No Frost con 360L, dispensador de agua, tecnología EcoSmart y diseño moderno en acero.', [WHT]),
  refri('Whirlpool Refrigerador 2 Puertas 270L', 'Whirlpool', 379, 15,
    'Refrigerador de 2 puertas con 270L, tecnología 6th Sense y congelador inferior. Ideal para familias pequeñas.', [WHT]),
  refri('Fensa Refrigerador Frío Húmedo 380L', 'Fensa', 419, 10,
    'Refrigerador 380L con sistema Frío Húmedo que conserva mejor los alimentos, eficiencia energética A+.', [WHT, SLV]),

  lavad('Samsung Lavadora Carga Frontal 12kg', 'Samsung', 649, 7,
    'Lavadora carga frontal 12kg con tecnología EcoBubble, programa AI y clasificación energética A.', [WHT]),
  lavad('LG Lavadora Carga Frontal 14kg', 'LG', 799, 6,
    'Lavadora 14kg con motor Direct Drive, tecnología Steam+ y conectividad ThinQ para control desde tu celular.', [WHT]),
  lavad('Whirlpool Lavadora Carga Superior 18kg', 'Whirlpool', 449, 9,
    'Lavadora de carga superior 18kg con 12 programas de lavado, tecnología 6th Sense y capacidad extra.', [WHT]),
  lavad('Mabe Lavadora Automática 20kg', 'Mabe', 399, 11,
    'Lavadora automática 20kg con 10 programas de lavado, tina de acero inoxidable y tecnología de ahorro de agua.', [WHT]),

  cocin('Mabe Cocina a Gas 6 Quemadores', 'Mabe', 599, 6,
    'Cocina a gas con 6 quemadores, horno a gas de 66L, parrillas fundición y encendido electrónico.', [SLV]),
  cocin('Fensa Cocina Eléctrica Vitrocerámica 4P', 'Fensa', 449, 8,
    'Cocina vitrocerámica 4 platos con horno eléctrico multifunción de 60L, grill y temporizador digital.', [BLK]),
  cocin('Samsung Horno Empotrable Eléctrico 60L', 'Samsung', 649, 4,
    'Horno empotrable eléctrico 60L con 10 funciones, limpieza por vapor, display digital y control deslizante.', [BLK]),
  cocin('Oster Horno Eléctrico Sobremesa 46L', 'Oster', 199, 14,
    'Horno eléctrico de sobremesa 46L con convección, tostador, 9 funciones y temperatura hasta 230°C.', [BLK, SLV]),

  micro('LG Microondas NeoChef 25L', 'LG', 149, 18,
    'Microondas NeoChef 25L con tecnología Smart Inverter, 10 niveles de potencia y limpieza EasyClean.', [BLK]),
  micro('Samsung Microondas con Grill 28L', 'Samsung', 179, 12,
    'Microondas con grill 28L, 900W de potencia, función combi grill+microondas y display LED.', [BLK]),
  micro('Oster Microondas Digital 30L', 'Oster', 129, 20,
    'Microondas digital 30L con 1000W, panel táctil, 6 programas automáticos y función descongelar.', [BLK]),
];
