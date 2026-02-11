// @ts-nocheck

import { MinLength, IsPhoneNumber, IsString } from "class-validator";

export interface ConsultInfo {
  username: string;
  сomplaints: string;
  phone: string;
}

export class ConsultDTO {
  @IsString()
  @MinLength(2)
  username: string;

  @IsString()
  @MinLength(15)
  complaints: string;

  @IsPhoneNumber()
  phone: string;
}