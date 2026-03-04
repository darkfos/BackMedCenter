import { Repository } from "typeorm";

import { dbSource } from "@/db/data-source";
import { Analyses } from "@/module/analysis";
import { Analysis } from "@/module/analysis/dto/Analysis.dto";
import { StatusPacient } from "@/utils/shared/entities_enums.js";
import { Pacients } from "@/module/pacients";

export interface CreateAnalysisBody {
  type: string;
  text?: string;
  assignedDate: string;
  costs?: number;
}

export class AnalysisService {
  private static get repository(): Repository<Analyses> {
    return dbSource.getRepository(Analyses);
  }

  private static get pacientsRepository(): Repository<Pacients> {
    return dbSource.getRepository(Pacients);
  }

  static async getList(
    filters: Pick<Analysis, "type" | "status" | "costs"> | {} = {},
  ) {
    const analysis = await this.repository.findAndCount({
      where: {
        ...filters,
      },
    });

    return analysis;
  }

  /** Создать анализ от имени доктора для карточки пациента. Карточка должна принадлежать доктору. */
  static async createForDoctor(
    doctorId: number,
    cardId: number,
    body: CreateAnalysisBody,
  ): Promise<Analyses | null> {
    const card = await this.pacientsRepository.findOne({
      where: { id: cardId, doctor: { id: doctorId } },
      relations: ["doctor"],
    });
    if (!card) return null;
    const entity = this.repository.create({
      type: body.type,
      text: body.text ?? undefined,
      status: StatusPacient.UNDEFINED,
      assignedDate: new Date(body.assignedDate),
      costs: body.costs ?? 100,
      pacient: card,
      doctor: { id: doctorId },
    } as unknown as Partial<Analyses>);
    const saved = await this.repository.save(entity);
    return (Array.isArray(saved) ? saved[0] : saved) as Analyses;
  }

  /** Список анализов по карточке пациента (для врача; карточка должна принадлежать врачу). */
  static async getByCardIdForDoctor(
    cardId: number,
    doctorId: number,
  ): Promise<Array<{
    id: number;
    type: string;
    text: string | null;
    assignedDate: string;
    costs: number;
    doctorName: string;
  }>> {
    const card = await this.pacientsRepository.findOne({
      where: { id: cardId, doctor: { id: doctorId } },
      select: ["id"],
    });
    if (!card) return [];
    const rows = await this.repository.find({
      where: { pacient: { id: cardId } },
      relations: ["doctor"],
      order: { id: "DESC" },
    });
    return rows.map((r) => {
      const doctor = r.doctor as { fullName?: string } | undefined;
      const assigned = r.assignedDate instanceof Date ? r.assignedDate.toISOString().slice(0, 10) : String(r.assignedDate).slice(0, 10);
      const costsNum = typeof r.costs === "number" ? r.costs : Number(r.costs) || 0;
      return {
        id: r.id,
        type: r.type,
        text: r.text ?? null,
        assignedDate: assigned,
        costs: costsNum,
        doctorName: doctor?.fullName ?? "",
      };
    });
  }
}
