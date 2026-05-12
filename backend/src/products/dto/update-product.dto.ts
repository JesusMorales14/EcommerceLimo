import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() price?: number;
  @IsOptional() @IsNumber() discount?: number;
  @IsOptional() @IsNumber() stock?: number;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() subCategory?: string;
  @IsOptional() @IsBoolean() isOffer?: boolean;
  @IsOptional() @IsArray() images?: string[];
  @IsOptional() @IsArray() colors?: string[];
  @IsOptional() @IsArray() sizes?: string[];
  @IsOptional() @IsObject() colorImages?: Record<string, string[]>;
}
