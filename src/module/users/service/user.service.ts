import { Repository, DeepPartial } from "typeorm";

import { dbSource } from "@/db/data-source.js";
import { User } from "@/module/users";
import { RegUserInfo } from "@/module/auth";
import { hashPassword } from "@/utils/other/hash_password.js";
import { UserTypes, FormatWorks } from "@/utils/shared/entities_enums.js";
import type { CreateDoctorDTO } from "@/module/users/dto/CreateDoctor.dto.js";
import { ClinicTypeEntity, ReviewEntity } from "@/module/services";
import { Pacients } from "@/module/pacients";

export class UserService {
  private static get repository(): Repository<User> {
    return dbSource.getRepository(User);
  }

  private static get clinicTypeRepository(): Repository<ClinicTypeEntity> {
    return dbSource.getRepository(ClinicTypeEntity);
  }

  private static get pacientsRepository(): Repository<Pacients> {
    return dbSource.getRepository(Pacients);
  }

  private static get reviewRepository(): Repository<ReviewEntity> {
    return dbSource.getRepository(ReviewEntity);
  }

  static async createUser(userData: RegUserInfo): Promise<User> {
    const newHashedPassword = await hashPassword(userData.password);
    userData.password = newHashedPassword;

    const repository: Repository<User> = dbSource.getRepository(User);
    const newUser = await repository.create(userData);

    return await repository.save(newUser);
  }

  static async createDoctor(data: CreateDoctorDTO): Promise<User | null> {
    const existing = await this.repository.findOne({ where: { email: data.email } });
    if (existing) {
      return null;
    }

    const hashedPassword = await hashPassword(data.password);
    const clinicType = data.clinicTypeId
      ? await this.clinicTypeRepository.findOne({ where: { id: data.clinicTypeId } })
      : null;

    const userData: DeepPartial<User> = {
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      userType: UserTypes.DOCTOR,
      avatar: data.avatar ?? "",
      experience: data.experience ?? 1,
      ...(data.studyBuild != null && { studyBuild: data.studyBuild }),
      position: data.position ?? "",
      competencies: data.competencies ?? [],
      consultPrice: data.consultPrice ?? 0,
      scheduleWork: data.scheduleWork ?? "8:00 - 17:00",
      dayWork: (data.dayWork ?? { days: ["пн"] }) as User["dayWork"],
      formatWork: (data.formatWork ?? FormatWorks.OCH) as FormatWorks,
    };
    if (clinicType) {
      userData.clinicType = clinicType;
    }
    const user = this.repository.create(userData);

    return await this.repository.save(user);
  }

  static async updateDoctor(id: number, data: Partial<CreateDoctorDTO>): Promise<Omit<User, "password"> | null> {
    const user = await this.repository.findOne({
      where: { id },
      relations: ["clinicType"],
    });
    if (!user || user.userType !== UserTypes.DOCTOR) {
      return null;
    }

    if (data.password) {
      user.password = await hashPassword(data.password);
    }
    if (data.email !== undefined) user.email = data.email;
    if (data.fullName !== undefined) user.fullName = data.fullName;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    if (data.experience !== undefined) user.experience = data.experience;
    if (data.studyBuild !== undefined) user.studyBuild = data.studyBuild;
    if (data.position !== undefined) user.position = data.position;
    if (data.competencies !== undefined) user.competencies = data.competencies;
    if (data.consultPrice !== undefined) user.consultPrice = data.consultPrice;
    if (data.scheduleWork !== undefined) user.scheduleWork = data.scheduleWork;
    if (data.dayWork !== undefined) user.dayWork = data.dayWork as User["dayWork"];
    if (data.formatWork !== undefined) user.formatWork = data.formatWork as FormatWorks;
    if (data.clinicTypeId !== undefined) {
      const clinicType = await this.clinicTypeRepository.findOne({ where: { id: data.clinicTypeId } });
      if (clinicType) user.clinicType = clinicType;
    }

    const saved = await this.repository.save(user);
    return Object.fromEntries(
      Object.entries(saved).filter(([key]) => key !== "password")
    ) as Omit<User, "password">;
  }

  static async getUserByEmail(email: string): Promise<Omit<User, "password">> {
    const user = await this.repository.findOne({ where: { email } });

    return Object.fromEntries(
      Object.entries(user as User).filter(
        ([key, _]) => !["password"].includes(key),
      ),
    ) as Omit<User, "password">;
  }

  static async getUserById(id: number): Promise<User | null> {
    return await this.repository.findOne({ where: { id }, relations: ["clinicType"] });
  }

  /** Удаление доктора (только для админа). Сначала открепляются пациенты, затем удаляется пользователь. */
  static async deleteDoctor(id: number): Promise<boolean> {
    const user = await this.repository.findOne({
      where: { id },
      select: { id: true, userType: true },
    });
    if (!user || user.userType !== UserTypes.DOCTOR) {
      return false;
    }
    const patients = await this.pacientsRepository.find({ where: { doctor: { id } } });
    for (const p of patients) {
      (p as { doctor?: unknown }).doctor = null;
      await this.pacientsRepository.save(p);
    }
    await this.reviewRepository.delete({ doctor: { id } });
    await this.reviewRepository.delete({ user: { id } });
    await this.repository.remove(user);
    return true;
  }

  /** Обновление аватара доктора по id. Возвращает обновлённого пользователя без пароля или null. */
  static async updateDoctorAvatar(doctorId: number, avatarFilename: string): Promise<Omit<User, "password"> | null> {
    const doctor = await this.repository.findOne({
      where: { id: doctorId },
      select: { id: true, userType: true },
    });
    if (!doctor || doctor.userType !== UserTypes.DOCTOR) return null;
    const user = await this.repository.findOne({ where: { id: doctorId } });
    if (!user) return null;
    user.avatar = avatarFilename;
    const saved = await this.repository.save(user);
    return Object.fromEntries(
      Object.entries(saved).filter(([key]) => key !== "password"),
    ) as Omit<User, "password">;
  }

  /** Список пациентов, закреплённых за доктором. По id пользователя-доктора возвращает список пациентов. */
  static async getPatientsByDoctorId(doctorId: number): Promise<Pacients[] | null> {
    const doctor = await this.repository.findOne({
      where: { id: doctorId },
      select: { id: true, userType: true },
    });
    if (!doctor || doctor.userType !== UserTypes.DOCTOR) {
      return null;
    }
    return await this.pacientsRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ["pacient"],
    });
  }

  static async updatePassword(email: string, newPassword: string) {
    const hashedPassword = await hashPassword(newPassword);
    const user = await this.repository.findOne({ where: { email } });

    if (user) {
      user.password = hashedPassword;
      await this.repository.save(user);
      return true;
    }

    return false;
  }

  /** Обновление персональных данных пользователя (имя, email, телефон, номер полиса). */
  static async updateProfile(
    email: string,
    data: { fullName?: string; email?: string; phone?: string; policyNumber?: string },
  ): Promise<Omit<User, "password"> | null> {
    const user = await this.repository.findOne({ where: { email } });
    if (!user) return null;

    if (data.email !== undefined && data.email !== user.email) {
      const existing = await this.repository.findOne({ where: { email: data.email } });
      if (existing) return null;
      user.email = data.email;
    }
    if (data.fullName !== undefined) user.fullName = data.fullName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.policyNumber !== undefined) user.policyNumber = data.policyNumber;

    const saved = await this.repository.save(user);
    return Object.fromEntries(
      Object.entries(saved).filter(([key]) => key !== "password"),
    ) as Omit<User, "password">;
  }
}
