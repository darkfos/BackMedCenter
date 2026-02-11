// @ts-nocheck

import { IsString, IsOptional } from "class-validator";

export class DoctorDTO {
  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  specialization: string;
}