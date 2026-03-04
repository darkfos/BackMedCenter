import { Repository, DeepPartial, In, MoreThanOrEqual } from "typeorm";

import { dbSource } from "@/db/data-source.js";
import { User } from "@/module/users";
import { RegUserBodyDTO, RegUserInfo } from "@/module/auth";
import { hashPassword } from "@/utils/other/hash_password.js";
import { UserTypes, FormatWorks } from "@/utils/shared/entities_enums.js";
import type { CreateDoctorDTO } from "@/module/users/dto/CreateDoctor.dto.js";
import { ClinicTypeEntity, ReviewEntity } from "@/module/services";
import { Pacients } from "@/module/pacients";
import { PacientVisit } from "@/module/pacients/entity/PacientVisits.entity.js";

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

  private static get visitRepository(): Repository<PacientVisit> {
    return dbSource.getRepository(PacientVisit);
  }

  /** Статистика для панели администратора. */
  static async getAdminStats(): Promise<{
    totalUsers: number;
    usersThisMonth: number;
    appointmentsToday: number;
    revenueToday: number;
    revenueGrowthPercent: number;
    systemLoad: number;
    systemLoadLabel: string;
  }> {
    const today = new Date();
    const y = today.getFullYear();
    const m = (today.getMonth() + 1).toString().padStart(2, "0");
    const d = today.getDate().toString().padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;
    const firstDayOfMonth = new Date(y, today.getMonth(), 1);

    const totalUsers = await this.repository.count();
    const usersThisMonth = await this.repository.count({
      where: { createdAt: MoreThanOrEqual(firstDayOfMonth) },
    });

    const todayDate = new Date(y, today.getMonth(), today.getDate());
    const appointmentsToday = await this.visitRepository.count({
      where: {
        dateVisit: todayDate,
        appointmentStatus: In(["pending", "confirmed"]),
      },
    });

    let revenueToday = 0;
    const visitRepo = this.visitRepository;
    const qb = visitRepo
      .createQueryBuilder("v")
      .innerJoin("v.pacient", "p")
      .innerJoin("p.doctor", "d")
      .where("v.dateVisit = :today", { today: todayStr })
      .andWhere("v.appointmentStatus IN (:...statuses)", {
        statuses: ["pending", "confirmed"],
      })
      .select("COALESCE(SUM(d.consultPrice), 0)", "revenue");
    const raw = await qb.getRawOne<{ revenue: string }>();
    if (raw?.revenue != null) {
      revenueToday = Number(raw.revenue) || 0;
    }

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = `${weekAgo.getFullYear()}-${(weekAgo.getMonth() + 1).toString().padStart(2, "0")}-${weekAgo.getDate().toString().padStart(2, "0")}`;
    let revenueLastWeek = 0;
    const qbLastWeek = visitRepo
      .createQueryBuilder("v")
      .innerJoin("v.pacient", "p")
      .innerJoin("p.doctor", "d")
      .where("v.dateVisit >= :from", { from: weekAgoStr })
      .andWhere("v.dateVisit < :to", { to: todayStr })
      .andWhere("v.appointmentStatus IN (:...statuses)", {
        statuses: ["pending", "confirmed"],
      })
      .select("COALESCE(SUM(d.consultPrice), 0)", "revenue");
    const rawLastWeek = await qbLastWeek.getRawOne<{ revenue: string }>();
    if (rawLastWeek?.revenue != null) {
      revenueLastWeek = Number(rawLastWeek.revenue) || 0;
    }
    const revenueGrowthPercent =
      revenueLastWeek > 0
        ? Math.round(((revenueToday - revenueLastWeek) / revenueLastWeek) * 100)
        : revenueToday > 0 ? 100 : 0;

    const systemLoad = 67;
    const systemLoadLabel = "Нормальная";

    return {
      totalUsers,
      usersThisMonth,
      appointmentsToday,
      revenueToday,
      revenueGrowthPercent,
      systemLoad,
      systemLoadLabel,
    };
  }

  /** Список пользователей, ожидающих подтверждения регистрации (пагинация). */
  static async getPendingApprovalUsers(
    page: number,
    pageSize: number,
  ): Promise<{ list: Omit<User, "password">[]; total: number; page: number; pageSize: number }> {
    const skip = Math.max(0, (page - 1) * pageSize);
    const take = Math.min(50, Math.max(1, pageSize));

    const [list, total] = await this.repository.findAndCount({
      where: { isConfirmed: false },
      select: ["id", "email", "fullName", "phone", "createdAt", "userType", "isConfirmed"],
      order: { createdAt: "DESC" },
      skip,
      take,
    });

    const listWithoutPassword = list.map((u) =>
      Object.fromEntries(
        Object.entries(u).filter(([key]) => key !== "password"),
      ),
    ) as Omit<User, "password">[];

    return {
      list: listWithoutPassword,
      total,
      page,
      pageSize: take,
    };
  }

  /** Подтвердить регистрацию пользователя (только для админа). */
  static async approveUser(id: number): Promise<boolean> {
    const user = await this.repository.findOne({
      where: { id },
      select: { id: true, isConfirmed: true },
    });
    if (!user) return false;
    user.isConfirmed = true;
    await this.repository.save(user);
    return true;
  }

  /** Отклонить регистрацию — удалить пользователя из системы (только для админа). */
  static async rejectUser(id: number): Promise<boolean> {
    const user = await this.repository.findOne({
      where: { id, isConfirmed: false },
      select: { id: true },
    });
    if (!user) return false;
    const cards = await this.pacientsRepository.find({
      where: { pacient: { id } },
      select: { id: true },
    });
    const cardIds = cards.map((c) => c.id);
    if (cardIds.length > 0) {
      await this.visitRepository
        .createQueryBuilder()
        .delete()
        .from(PacientVisit)
        .where("pacientId IN (:...ids)", { ids: cardIds })
        .execute();
    }
    for (const card of cards) {
      await this.pacientsRepository.remove(card);
    }
    await this.reviewRepository.delete({ user: { id } });
    await this.repository.remove(user);
    return true;
  }

  static async createUser(userData: RegUserBodyDTO): Promise<User> {
    const newHashedPassword = await hashPassword(userData.password as string);
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
      education: data.education ?? null,
      description: data.description ?? null,
      certificates: data.certificates ?? [],
      services: data.services ?? [],
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
    if (data.education !== undefined) user.education = data.education;
    if (data.description !== undefined) user.description = data.description;
    if (data.certificates !== undefined) user.certificates = data.certificates;
    if (data.services !== undefined) user.services = data.services;
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

  static async getUserByEmail(email: string): Promise<Omit<User, "password"> | null> {
    const user = await this.repository.findOne({ where: { email } });
    if (!user) return null;

    return Object.fromEntries(
      Object.entries(user).filter(
        ([key]) => !["password"].includes(key),
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

    if (!user?.isConfirmed) return false;
    
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
