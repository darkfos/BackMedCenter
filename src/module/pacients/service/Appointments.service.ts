import { In, Repository } from "typeorm";
import { dbSource } from "@/db/data-source.js";
import { PacientVisit } from "@/module/pacients/entity/PacientVisits.entity.js";
import { Pacients } from "@/module/pacients/entity/Pacients.entity.js";
import { User } from "@/module/users";
import { AppointmentStatus } from "@/utils/shared/entities_enums.js";
import type { CreateAppointmentDTO } from "@/module/pacients/dto/CreateAppointment.dto.js";

export class AppointmentsService {
  private static get visitRepository(): Repository<PacientVisit> {
    return dbSource.getRepository(PacientVisit);
  }

  private static get pacientsRepository(): Repository<Pacients> {
    return dbSource.getRepository(Pacients);
  }

  private static get userRepository(): Repository<User> {
    return dbSource.getRepository(User);
  }

  /** Все приёмы текущего пользователя (по всем картам), сортировка: дата по убыванию, время */
  static async getByUserId(userId: number): Promise<PacientVisit[]> {
    const cards = await this.pacientsRepository.find({
      where: { pacient: { id: userId } },
      select: ["id"],
    });
    const cardIds = cards.map((c) => c.id);
    if (cardIds.length === 0) return [];
    return await this.visitRepository.find({
      where: { pacient: { id: In(cardIds) } },
      relations: ["pacient", "pacient.doctor", "pacient.doctor.clinicType"],
      order: { dateVisit: "ASC", time: "ASC" },
    });
  }

  /** Создание приёма: пользователь записывается к доктору. Если карты (пациент+доктор) нет — создаётся автоматически. */
  static async create(
    userId: number,
    data: CreateAppointmentDTO,
  ): Promise<PacientVisit | null> {
    const patient = await this.userRepository.findOne({
      where: { id: userId },
    });
    const doctor = await this.userRepository.findOne({
      where: { id: data.doctorId },
    });
    if (!patient || !doctor) return null;

    let card = await this.pacientsRepository.findOne({
      where: {
        pacient: { id: userId },
        doctor: { id: data.doctorId },
      },
    });
    if (!card) {
      card = this.pacientsRepository.create({
        pacient: patient,
        doctor,
      });
      card = await this.pacientsRepository.save(card);
    }

    const visit = this.visitRepository.create({
      dateVisit: new Date(data.dateVisit),
      time: data.time,
      roomNumber: data.roomNumber ?? null,
      appointmentStatus: AppointmentStatus.PENDING,
      pacient: card,
    });
    const saved = await this.visitRepository.save(visit);
    return await this.visitRepository.findOne({
      where: { id: saved.id },
      relations: ["pacient", "pacient.doctor", "pacient.doctor.clinicType"],
    });
  }
}
