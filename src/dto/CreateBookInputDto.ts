import { Type } from 'class-transformer';
import { ValidateNested, IsArray, ArrayNotEmpty, IsString, IsNotEmpty, IsInt, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateBookInputDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required for creation.' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Author is required.' })
  author!: string;

  // owner_id and library_id are now derived from request context (JWT and URL params)
  // These fields are accepted but ignored for security reasons
  @IsInt()
  @IsOptional()
  owner_id?: number;

  @IsInt()
  @IsOptional()
  library_id?: number;

  @IsString()
  @IsOptional()
  status?: string;

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

  @IsString()
  @IsOptional()
  is_private?: string;
}

// 2. DTO representing the *entire* request wrapper.
export class BookBatchRequestDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'The book list must not be empty.' })
  @ValidateNested({ each: true }) // Crucial: Tells validator to check *every* item in the array
  @Type(() => CreateBookInputDto) // Crucial: Tells class-transformer how to convert the plain objects
  'booklist': CreateBookInputDto[]; // Exact property name expected in JSON body
}