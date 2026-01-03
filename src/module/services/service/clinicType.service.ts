import { ILike, Repository } from "typeorm";

import { dbSource } from "@/db/data-source";
import { ClinicTypeEntity } from "@/module/services";
import { ClinicType } from "@/module/services";

export class ClinicTypeService {

  protected static clinicTypeRepository: Repository<ClinicTypeEntity> = dbSource.getRepository(ClinicTypeEntity);

  static async create(data: ClinicType) {
    try {
      const newClinicType = await this.clinicTypeRepository.create(data);
      await this.clinicTypeRepository.save(newClinicType);
      return newClinicType;
    } catch {
      return false;
    }
  }

  static async all(filters: Pick<ClinicType, 'name'>) {
    return await this.clinicTypeRepository.findAndCount({ where: filters?.name ? {
        name: ILike(`%${filters.name}%`)
    } : {}});
  }
}