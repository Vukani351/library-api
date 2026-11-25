import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateWishlistBookDto {
  @IsInt()
  book_id!: number;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  category?: string;
}

export class CreateWishlistDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  accessibility?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWishlistBookDto)
  @IsOptional()
  wishlist_book?: CreateWishlistBookDto[];
}
