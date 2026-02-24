import { IsOptional } from "class-validator";

export class PaginationQuery {
    
    @IsOptional()
    page!: string;

    @IsOptional()
    pageSize!: string;
}
