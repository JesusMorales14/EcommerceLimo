import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

/** Todos los campos del producto son opcionales al actualizar. */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
