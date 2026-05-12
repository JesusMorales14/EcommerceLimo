import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class OrderItemDto {
  @IsNumber()
  productId!: number;

  @IsNumber()
  quantity!: number;
}

class DeliveryDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() notes?: string;
  @IsNumber() @IsOptional() lat?: number;
  @IsNumber() @IsOptional() lng?: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsString() @IsOptional()
  paymentMethod?: string;

  @IsString() @IsOptional()
  couponCode?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery?: DeliveryDto;
}
