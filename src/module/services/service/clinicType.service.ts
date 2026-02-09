import { ILike, Repository } from "typeorm";

import { dbSource } from "@/db/data-source";
import { ClinicTypeEntity } from "@/module/services";
import { ClinicType } from "@/module/services";

export class ClinicTypeService {
  private static get repository(): Repository<ClinicTypeEntity> {
    return dbSource.getRepository(ClinicTypeEntity);
  }

  static async create(data: ClinicType) {
    try {
      const newClinicType = await this.repository.create(data);
      await this.repository.save(newClinicType);
      return newClinicType;
    } catch {
      return false;
    }
  }

  static async all(filters: Pick<ClinicType, "name">) {
    return await this.repository.findAndCount({
      where: filters?.name
        ? {
            name: ILike(`%${filters.name}%`),
          }
        : {},
    });
  }
}
