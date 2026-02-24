import { IsString, IsOptional, IsInt, IsIn, MaxLength } from "class-validator";
import { Type } from "class-transformer";

export class CreateMedicalHistoryDTO {
  @IsString()
  @MaxLength(165)
  diseases!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Type(() => Number)
  doctorId!: number;

  @IsOptional()
  @IsString()
  @IsIn(["active", "completed"])
  status?: string;
}
