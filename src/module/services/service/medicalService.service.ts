import { FindOptionsWhere, ILike, In, Repository } from "typeorm";
import { dbSource } from "@/db/data-source.js";
import { ServiceEntity } from "@/module/services/entity/Service.entity.js";
import { ClinicTypeEntity } from "@/module/services/entity/ClinicType.entity.js";
import { User } from "@/module/users";
import type { CreateServiceDTO } from "@/module/services/dto/CreateService.dto.js";
import { MedicalServiceDTO } from "@/module/services/dto/ClinicType.dto.js";

export class MedicalServiceService {
  private static get repository(): Repository<ServiceEntity> {
    return dbSource.getRepository(ServiceEntity);
  }

  private static get clinicTypeRepository(): Repository<ClinicTypeEntity> {
    return dbSource.getRepository(ClinicTypeEntity);
  }

  private static get userRepository(): Repository<User> {
    return dbSource.getRepository(User);
  }

  static async create(data: CreateServiceDTO): Promise<ServiceEntity | null> {
    const clinicType = await this.clinicTypeRepository.findOne({
      where: { id: data.clinicTypeId },
    });
    if (!clinicType) return null;

    const doctors: User[] = [];
    if (data.doctorIds?.length) {
      const users = await this.userRepository.findBy({
        id: In(data.doctorIds),
      });
      doctors.push(...users);
    }

    const service = this.repository.create({
      title: data.title,
      description: data.description ?? null,
      timeWork: data.timeWork ?? null,
      price: data.price ?? 2500,
      includesIn: data.includesIn ?? [],
      specialists: data.specialists ?? [],
      clinicType,
      doctors,
    });
    const saved = await this.repository.save(service);
    return await this.repository.findOne({
      where: { id: saved.id },
      relations: ["clinicType", "doctors"],
    });
  }

  static async getAll(): Promise<Record<string, { name: string, servicesCnt: number }>> {

    const allClinicTypes = await this.clinicTypeRepository.find({});

    const allServices = await this.repository.find({
      relations: ["clinicType", "doctors"],
      order: { 'clinicType': { id: 'ASC'} },
    });

    const groupedServices: Record<number, { name: string, clinicLocaleName: string, servicesCnt: number }> = {};

    for (const clinicType of allClinicTypes) {
      groupedServices[clinicType.id] = { name: clinicType.icon, clinicLocaleName: clinicType.name, servicesCnt: 0 };
    };

    for (const service of allServices) {

      const key = service?.clinicType?.id ?? 0;
      if (typeof groupedServices?.[key]?.servicesCnt === 'number') {
        groupedServices[key].servicesCnt++;
      }
    }

    return groupedServices;
  }

  static async getServiceByFilters(filters: MedicalServiceDTO): Promise<ServiceEntity[]> {
    const services = this.repository.find({
      where: {
        ...(filters.clinicType ? {'clinicType': { 'id': +filters.clinicType }} : {}),
        ...(filters.serviceName ? {'title': ILike(`%${filters.serviceName.toLowerCase()}%`)} : {})
      },
      relations: ['clinicType', 'doctors']
    })

    return services;
  }
}
