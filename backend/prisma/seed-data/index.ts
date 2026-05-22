import { electrodomesticos } from './electrodomesticos';
import { tecnologia } from './tecnologia';
import { modaMujer } from './moda-mujer';
import { modaHombre } from './moda-hombre';
import { hogar } from './hogar';
import { deporte } from './deporte';
import { belleza } from './belleza';

export const PRODUCTS = [
  ...electrodomesticos,
  ...tecnologia,
  ...modaMujer,
  ...modaHombre,
  ...hogar,
  ...deporte,
  ...belleza,
];
