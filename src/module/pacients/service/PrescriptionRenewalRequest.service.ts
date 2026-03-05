import { Repository } from "typeorm";
import { dbSource } from "@/db/data-source.js";
import { PrescriptionRenewalRequest } from "@/module/pacients/entity/PrescriptionRenewalRequest.entity.js";
import { PacientPrescriptions } from "@/module/pacients/entity/PacientPrescriptions.entity.js";
import { Pacients } from "@/module/pacients/entity/Pacients.entity.js";
import { User } from "@/module/users";

export class PrescriptionRenewalRequestService {
  private static get repository(): Repository<PrescriptionRenewalRequest> {
    return dbSource.getRepository(PrescriptionRenewalRequest);
  }

  private static get prescriptionRepository(): Repository<PacientPrescriptions> {
    return dbSource.getRepository(PacientPrescriptions);
  }

  private static get pacientsRepository(): Repository<Pacients> {
    return dbSource.getRepository(Pacients);
  }

  private static get userRepository(): Repository<User> {
    return dbSource.getRepository(User);
  }

  /** Создать запрос на продление рецепта (пациент). */
  static async createRequest(
    patientUserId: number,
    prescriptionId: number,
  ): Promise<PrescriptionRenewalRequest | null> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id: prescriptionId },
      relations: ["pacient", "pacient.pacient", "doctor"],
    });
    if (!prescription?.doctor) return null;
    const card = prescription.pacient as Pacients & { pacient?: User | { id?: number } };
    const patientId = (card?.pacient as { id?: number })?.id;
    if (patientId !== patientUserId) return null;
    const doctorId = (prescription.doctor as { id?: number }).id;
    if (!doctorId) return null;
    const existing = await this.repository.findOne({
      where: {
        prescription: { id: prescriptionId },
        patientUser: { id: patientUserId },
        status: "pending",
      },
    });
    if (existing) return null;
    const request = this.repository.create({
      prescription: { id: prescriptionId },
      patientUser: { id: patientUserId },
      doctor: { id: doctorId },
      status: "pending",
    });
    return await this.repository.save(request);
  }

  /** Список запросов на продление для пациента. */
  static async getByPatientUserId(patientUserId: number) {
    return await this.repository.find({
      where: { patientUser: { id: patientUserId } },
      relations: ["prescription", "doctor"],
      order: { createdAt: "DESC" },
    });
  }

  /** Список запросов на продление для врача (ожидающие решения). */
  static async getByDoctorId(doctorId: number) {
    return await this.repository.find({
      where: { doctor: { id: doctorId } },
      relations: ["prescription", "patientUser"],
      order: { createdAt: "DESC" },
    });
  }

  /** Одобрить или отклонить запрос (врач). */
  static async setStatus(
    requestId: number,
    doctorId: number,
    status: "approved" | "rejected",
  ): Promise<boolean> {
    const request = await this.repository.findOne({
      where: { id: requestId, doctor: { id: doctorId } },
    });
    if (!request || request.status !== "pending") return false;
    request.status = status;
    await this.repository.save(request);
    return true;
  }
}
