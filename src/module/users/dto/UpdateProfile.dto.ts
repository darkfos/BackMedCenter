import { IsString, IsOptional, IsEmail, MaxLength, Matches, IsArray } from "class-validator";

export class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[\d\s+\-()]*$/, { message: "Некорректный формат телефона" })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  policyNumber?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certificates?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(185)
  position?: string;
}
