import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsNumber,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateServiceDTO {
  @IsString()
  @MaxLength(150)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  timeWork?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsInt()
  @Type(() => Number)
  clinicTypeId!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includesIn?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialists?: string[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  doctorIds?: number[];
}
