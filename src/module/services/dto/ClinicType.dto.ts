import { IsOptional, IsString } from "class-validator";

export interface ClinicType {
  name: string;
  icon: string;
}

export class MedicalServiceDTO {
  @IsOptional()
  @IsString()
  serviceName?: string;

  @IsString()
  @IsOptional()
  clinicType?: number;
}

export class ClinicDTO {

  @IsString()
  name?: string;

  @IsString()
  icon?: string;
}