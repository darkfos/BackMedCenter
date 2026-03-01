import { IsDefined, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from "class-validator";

export interface RegUserInfo {
  email: string;
  password: string;
  avatar: string;
}

export class RegUserBodyDTO {
  @IsDefined({ message: "email обязателен" })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsDefined({ message: "fullName обязателен" })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsDefined({ message: "phone обязателен" })
  @IsString()
  @IsPhoneNumber(undefined, { message: "phone должен быть валидным номером" })
  @IsNotEmpty()
  phone!: string;

  @IsDefined({ message: "password обязателен" })
  @IsString()
  @MinLength(6, { message: "password не менее 6 символов" })
  @IsNotEmpty()
  password!: string;
}