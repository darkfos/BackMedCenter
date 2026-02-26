import { IsString, IsOptional, IsIn } from "class-validator";

import { FormatWorks } from "@/utils/shared/entities_enums.js";
import { PaginationQuery } from "@/utils/shared/validationQuery";

export class DoctorDTO extends PaginationQuery {
  @IsString()
  @IsOptional()
  username!: string;

  @IsString()
  @IsOptional()
  specialization!: number;

  @IsString()
  @IsOptional()
  @IsIn([FormatWorks.OCH, FormatWorks.ZOCH, FormatWorks.OTHER])
  formatWork!: FormatWorks;
}