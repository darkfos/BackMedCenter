import { Repository  } from "typeorm";
import type { FindOptionsWhere } from "typeorm";
import type { IPagination } from "../shared/interfaces";

export class Pagination<T extends {}> {
    
    constructor(private limit: number = 10, private repository: Repository<T>) {}

    async getPaginationData(where: FindOptionsWhere<T>, relations: Array<string>, page: number = 1, pageSize: number = this.limit): Promise<IPagination<T>> {
        
        const pageNum = Number.isNaN(page) || page < 1 ? 1 : page;
        const limitNum = Number.isNaN(pageSize) || pageSize < 1 ? this.limit : pageSize;

        const data = await this.repository.findAndCount({
            where: where,
            relations: [...relations],
            take: limitNum,
            skip: (pageNum - 1) * limitNum
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