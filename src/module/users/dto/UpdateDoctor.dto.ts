import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsIn,
  IsEmail,
  MinLength,
  MaxLength,
  IsObject,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { DayWorkDTO } from "./CreateDoctor.dto.js";

export class UpdateDoctorDTO {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: "Пароль должен быть не менее 6 символов" })
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  experience?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  studyBuild?: string;

  @IsOptional()
  @IsString()
  @MaxLength(185)
  position?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  competencies?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  consultPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  scheduleWork?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DayWorkDTO)
  dayWork?: DayWorkDTO;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clinicTypeId?: number;

  @IsOptional()
  @IsString()
  @IsIn(["och", "zoch", "other"], { message: "formatWork должен быть: och, zoch или other" })
  formatWork?: string;
}
