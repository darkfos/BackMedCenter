import { In, Repository } from "typeorm";
import { dbSource } from "@/db/data-source.js";
import { PacientPrescriptions } from "@/module/pacients/entity/PacientPrescriptions.entity.js";
import { Pacients } from "@/module/pacients/entity/Pacients.entity.js";

export interface CreatePrescriptionBody {
  prescriptionName: string;
  prescriptionDosage: string;
  prescriptionFrequency: string;
  prescriptionTime: string;
  description: string;
}

export class PrescriptionService {
  private static get prescriptionRepository(): Repository<PacientPrescriptions> {
    return dbSource.getRepository(PacientPrescriptions);
  }

  private static get pacientsRepository(): Repository<Pacients> {
    return dbSource.getRepository(Pacients);
  }

  /** Создать назначение от имени доктора для карточки пациента. Карточка должна принадлежать доктору. */
  static async create(
    doctorId: number,
    cardId: number,
    body: CreatePrescriptionBody,
  ): Promise<PacientPrescriptions | null> {
    const card = await this.pacientsRepository.findOne({
      where: { id: cardId, doctor: { id: doctorId } },
      relations: ["doctor"],
    });
    if (!card) return null;
    const prescription = this.prescriptionRepository.create({
      prescriptionName: body.prescriptionName,
      prescriptionDosage: body.prescriptionDosage,
      prescriptionFrequency: body.prescriptionFrequency,
      prescriptionTime: body.prescriptionTime,
      description: body.description,
      doctor: { id: doctorId },
      pacient: card,
    });
    return await this.prescriptionRepository.save(prescription);
  }

  /** Список назначений (препаратов) для пациента по userId с пагинацией. */
  static async getByPatientUserIdPage(
    userId: number,
    page: number,
    pageSize: number,
  ): Promise<{
    list: Array<{
      id: number;
      prescriptionName: string;
      prescriptionDosage: string;
      prescriptionFrequency: string;
      prescriptionTime: string;
      description: string;
      doctorId: number;
      doctorName: string;
      doctorSpecialty: string | null;
    }>;
    total: number;
    page: number;
    pageSize: number;
  }> {
    const cards = await this.pacientsRepository.find({
      where: { pacient: { id: userId } },
      select: ["id"],
    });
    const cardIds = cards.map((c) => c.id);
    if (cardIds.length === 0) {
      return { list: [], total: 0, page: 1, pageSize: Math.min(50, pageSize) };
    }
    const skip = Math.max(0, (page - 1) * pageSize);
    const take = Math.min(50, Math.max(1, pageSize));
    const [rows, total] = await this.prescriptionRepository.findAndCount({
      where: { pacient: { id: In(cardIds) } },
      relations: ["doctor", "doctor.clinicType"],
      order: { id: "DESC" },
      skip,
      take,
    });
    const list = rows.map((r) => {
      const doctor = r.doctor as { id?: number; fullName?: string; position?: string; clinicType?: { name?: string } } | undefined;
      return {
        id: r.id,
        prescriptionName: r.prescriptionName,
        prescriptionDosage: r.prescriptionDosage,
        prescriptionFrequency: r.prescriptionFrequency,
        prescriptionTime: r.prescriptionTime,
        description: r.description,
        doctorId: doctor?.id ?? 0,
        doctorName: doctor?.fullName ?? "",
        doctorSpecialty: doctor?.clinicType?.name ?? doctor?.position ?? null,
      };
    });
    return { list, total, page, pageSize: take };
  }

  /** Список назначений по карточке пациента (для врача; карточка должна принадлежать врачу). */
  static async getByCardIdForDoctor(
    cardId: number,
    doctorId: number,
  ): Promise<Array<{
    id: number;
    prescriptionName: string;
    prescriptionDosage: string;
    prescriptionFrequency: string;
    prescriptionTime: string;
    description: string;
    doctorName: string;
    createdAt?: string;
  }>> {
    const card = await this.pacientsRepository.findOne({
      where: { id: cardId, doctor: { id: doctorId } },
      select: ["id"],
    });
    if (!card) return [];
    const rows = await this.prescriptionRepository.find({
      where: { pacient: { id: cardId } },
      relations: ["doctor"],
      order: { id: "DESC" },
    });
    return rows.map((r) => {
      const doctor = r.doctor as { fullName?: string } | undefined;
      const created = (r as { createdAt?: Date }).createdAt;
      const createdAtStr =
        created ? (typeof created === "string" ? created : created.toISOString().slice(0, 10)) : undefined;
      return {
        id: r.id,
        prescriptionName: r.prescriptionName,
        prescriptionDosage: r.prescriptionDosage,
        prescriptionFrequency: r.prescriptionFrequency,
        prescriptionTime: r.prescriptionTime,
        description: r.description,
        doctorName: doctor?.fullName ?? "",
        ...(createdAtStr !== undefined && { createdAt: createdAtStr }),
      };
    });
  }
}
