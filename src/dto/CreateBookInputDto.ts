import { Type } from 'class-transformer';
import { ValidateNested, IsArray, ArrayNotEmpty, IsString, IsNotEmpty, IsInt, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateBookInputDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required for creation.' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Author is required.' })
  author!: string;

  @IsInt()
  @IsNotEmpty({ message: 'Book must have an owner_id.' })
  owner_id!: number;

  @IsInt()
  @IsNotEmpty({ message: 'Book must belong to a library (library_id).' })
  library_id!: number;

  @IsString()
  @IsNotEmpty({ message: 'Initial status is required.' })
  status!: string;

  // Optional inputs (allowed to be missing)
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsDateString()
  @IsOptional()
  return_by_date?: string;
}

// 2. DTO representing the *entire* request wrapper.
export class BookBatchRequestDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'The book list must not be empty.' })
  @ValidateNested({ each: true }) // Crucial: Tells validator to check *every* item in the array
  @Type(() => CreateBookInputDto) // Crucial: Tells class-transformer how to convert the plain objects
  'booklist': CreateBookInputDto[]; // Exact property name expected in JSON body
}