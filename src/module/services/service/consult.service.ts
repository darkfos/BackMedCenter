import { FindManyOptions, FindOptionsWhere, ILike, Repository } from "typeorm";

import { dbSource } from "@/db/data-source";
import { Consult, ConsultInfo } from "@/module/services";

export class ConsultService {

  protected static consultRepository: Repository<Consult> = dbSource.getRepository(Consult);

  static async create(consultData: ConsultInfo) {
      try {
        const newConsult = await this.consultRepository.create(consultData);
        await this.consultRepository.save(newConsult);
        return true;
      } catch {
        return false;
      }
  }

  static async all(filters: Partial<ConsultInfo>) {
    const activeFilters: FindOptionsWhere<Consult> = {};

    for (const key in filters) {
      if (filters[key as keyof ConsultInfo]) {
        activeFilters[key as keyof ConsultInfo] = ILike(`%${filters[key as keyof ConsultInfo]}%`);
      }
    }

    const allConsults = await this.consultRepository.findAndCount({
      where: activeFilters
    });

    return allConsults;
  }
}