import { IsString, IsOptional, IsEmail, MaxLength, Matches } from "class-validator";

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
}
