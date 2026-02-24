import {
  IsString,
  IsOptional,
  IsInt,
  MaxLength,
  Matches,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateAppointmentDTO {
  @IsInt()
  @Type(() => Number)
  doctorId!: number;

  @IsDateString()
  dateVisit!: string;

  @IsString()
  @MaxLength(10)
  @Matches(/^\d{1,2}:\d{2}$/, {
    message: "Время в формате ЧЧ:ММ, например 10:00",
  })
  time!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  roomNumber?: string;
}
