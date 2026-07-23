import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'iPhone 16',
    description: 'Назва продукту',
    maxLength: 255,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 999.99,
    description: 'Ціна у гривнях',
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @ApiPropertyOptional({
    example: 'Flagship smartphone',
    description: 'Опис продукту',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    example: 50,
    description: 'Кількість на складі',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID категорії',
  })
  @IsOptional()
  @IsInt()
  categoryId?: number;
}
