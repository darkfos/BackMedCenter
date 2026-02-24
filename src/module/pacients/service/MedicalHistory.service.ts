import { In, Repository } from "typeorm";
import { dbSource } from "@/db/data-source.js";
import { HistoryDiseases } from "@/module/pacients/entity/HistoryDiseases.entity.js";
import { Pacients } from "@/module/pacients/entity/Pacients.entity.js";
import { User } from "@/module/users";
import { HistoryRecordStatus } from "@/utils/shared/entities_enums.js";
import type { CreateMedicalHistoryDTO } from "@/module/pacients/dto/CreateMedicalHistory.dto.js";

export class MedicalHistoryService {
  private static get historyRepository(): Repository<HistoryDiseases> {
    return dbSource.getRepository(HistoryDiseases);
  }

  private static get pacientsRepository(): Repository<Pacients> {
    return dbSource.getRepository(Pacients);
  }

  private static get userRepository(): Repository<User> {
    return dbSource.getRepository(User);
  }

  static async getByPacientId(pacientId: number): Promise<HistoryDiseases[]> {
    return await this.historyRepository.find({
      where: { pacient: { id: pacientId } },
      relations: ["doctor", "doctor.clinicType"],
      order: { createdAt: "DESC" },
    });
  }

  /** История по id пользователя (пациента): все записи по всем картам этого пользователя */
  static async getByUserId(userId: number): Promise<HistoryDiseases[]> {
    const cards = await this.pacientsRepository.find({
      where: { pacient: { id: userId } },
      select: ["id"],
    });
    const cardIds = cards.map((c) => c.id);
    if (cardIds.length === 0) return [];
    return await this.historyRepository.find({
      where: { pacient: { id: In(cardIds) } },
      relations: ["doctor", "doctor.clinicType"],
      order: { createdAt: "DESC" },
    });
  }

  static async create(
    patientId: number,
    data: CreateMedicalHistoryDTO,
  ): Promise<HistoryDiseases | null> {
    const pacient = await this.pacientsRepository.findOne({
      where: { id: patientId },
    });
    const doctor = await this.userRepository.findOne({
      where: { id: data.doctorId },
    });
    if (!pacient || !doctor) return null;

    const record = this.historyRepository.create({
      diseases: data.diseases,
      description: data.description ?? "",
      status: data.status ?? HistoryRecordStatus.ACTIVE,
      doctor,
      pacient,
    });
    const saved = await this.historyRepository.save(record);
    return await this.historyRepository.findOne({
      where: { id: saved.id },
      relations: ["doctor", "doctor.clinicType"],
    });
  }
}
