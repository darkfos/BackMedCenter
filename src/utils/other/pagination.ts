import { Repository  } from "typeorm";
import type { FindOptionsWhere } from "typeorm";
import type { IPagination } from "../shared/interfaces";

export class Pagination<T extends {}> {
    
    constructor(private limit: number = 10, private repository: Repository<T>) {}

    async getPaginationData(where: FindOptionsWhere<T>, relations: Partial<{ [K in keyof T]: string | number | boolean}>, page: number = 1, pageSize: number = this.limit): Promise<IPagination<T>> {
        
        const [limit, pg] = [Number.isNaN(page) ? 1 : page, Number.isNaN(pageSize) ? this.limit : pageSize];

        const data = await this.repository.findAndCount({
            where: where,
            ...relations,
            take: limit,
            skip: (pg - 1) * limit
        });
        
        return {
            list: data[0],
            pagination: {
                page: page,
                pageSize: pageSize,
                total: data[1]
            }
        }
    }
}