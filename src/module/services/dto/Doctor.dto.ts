import { IsString, IsOptional, IsIn } from "class-validator";

import { FormatWorks } from "@/utils";
import { PaginationQuery } from "@/utils/shared/validationQuery";

export class DoctorDTO extends PaginationQuery {
  @IsString()
  @IsOptional()
  username!: string;

  @IsString()
  @IsOptional()
  specialization!: string;

  @IsString()
  @IsOptional()
  @IsIn([FormatWorks.OCH, FormatWorks.ZOCH, FormatWorks.OTHER])
  formatWork!: FormatWorks;
}