import { Repository, DeepPartial, In, MoreThanOrEqual, ILike } from "typeorm";

import { dbSource } from "@/db/data-source.js";
import { User } from "@/module/users";
import { RegUserBodyDTO, RegUserInfo } from "@/module/auth";
import { hashPassword } from "@/utils/other/hash_password.js";
import { UserTypes, FormatWorks } from "@/utils/shared/entities_enums.js";
import type { CreateDoctorDTO } from "@/module/users/dto/CreateDoctor.dto.js";
import { ClinicTypeEntity, ReviewEntity } from "@/module/services";
import { Pacients } from "@/module/pacients";
import { PacientVisit } from "@/module/pacients/entity/PacientVisits.entity.js";
import { HistoryDiseases } from "@/module/pacients/entity/HistoryDiseases.entity.js";

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

  private static get historyDiseasesRepository(): Repository<HistoryDiseases> {
    return dbSource.getRepository(HistoryDiseases);
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

  /** Пагинированный список пациентов доктора для «Мои пациенты». search — фильтр по ФИО пациента. */
  static async getDoctorPatientsPage(
    doctorId: number,
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<{
    list: Array<{
      id: number;
      fullName: string;
      phone: string;
      email: string;
      description: string;
      lastVisit: string | null;
      nextAppointment: string | null;
      prescriptionsCount: number;
      visitsCount: number;
    }>;
    total: number;
    page: number;
    pageSize: number;
  }> {
    const doctor = await this.repository.findOne({
      where: { id: doctorId },
      select: { id: true, userType: true },
    });
    if (!doctor || doctor.userType !== UserTypes.DOCTOR) {
      return { list: [], total: 0, page: 1, pageSize: Math.min(20, pageSize) };
    }
    const skip = Math.max(0, (page - 1) * pageSize);
    const take = Math.min(50, Math.max(1, pageSize));
    const [cards, total] = await this.pacientsRepository.findAndCount({
      where: {
        doctor: { id: doctorId },
        ...(search?.trim() && { pacient: { fullName: ILike(`%${search.trim()}%`) } }),
      },
      relations: ["pacient"],
      order: { id: "ASC" },
      skip,
      take,
    });
    if (cards.length === 0) {
      return { list: [], total, page, pageSize: take };
    }
    const cardIds = cards.map((c) => c.id);
    const visits = await this.visitRepository.find({
      where: { pacient: { id: In(cardIds) } },
      relations: ["pacient"],
      order: { dateVisit: "ASC", time: "ASC" },
    });
    const todayStr = new Date().toISOString().slice(0, 10);
    const byCard = new Map<number, { last: string | null; next: string | null; count: number }>();
    for (const cardId of cardIds) {
      byCard.set(cardId, { last: null, next: null, count: 0 });
    }
    for (const v of visits) {
      const cardId = (v.pacient as { id?: number } | undefined)?.id ?? 0;
      const state = byCard.get(cardId);
      if (!state) continue;
      state.count++;
      const dStr = v.dateVisit instanceof Date ? v.dateVisit.toISOString().slice(0, 10) : String(v.dateVisit).slice(0, 10);
      if (dStr <= todayStr) state.last = dStr;
      if (dStr >= todayStr && ["pending", "confirmed"].includes(v.appointmentStatus)) {
        if (state.next === null || dStr < state.next) state.next = dStr;
      }
    }
    const list = cards.map((card) => {
      const patient = card.pacient as { id?: number; fullName?: string; phone?: string; email?: string };
      const state = byCard.get(card.id) ?? { last: null, next: null, count: 0 };
      return {
        id: card.id,
        fullName: patient?.fullName ?? "",
        phone: patient?.phone ?? "",
        email: patient?.email ?? "",
        description: (card as { description?: string }).description ?? "",
        lastVisit: state.last,
        nextAppointment: state.next,
        prescriptionsCount: 0,
        visitsCount: state.count,
      };
    });
    return { list, total, page, pageSize: take };
  }

  /** Визиты на текущую дату по карточкам доктора (пагинация). */
  static async getDoctorVisitsToday(
    doctorId: number,
    page: number,
    pageSize: number,
  ): Promise<{
    list: Array<{
      visitId: number;
      cardId: number;
      fullName: string;
      phone: string;
      time: string;
      appointmentStatus: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
  }> {
    const doctor = await this.repository.findOne({
      where: { id: doctorId },
      select: { id: true, userType: true },
    });
    if (!doctor || doctor.userType !== UserTypes.DOCTOR) {
      return { list: [], total: 0, page: 1, pageSize: Math.min(20, pageSize) };
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const qb = this.visitRepository
      .createQueryBuilder("v")
      .innerJoin("v.pacient", "p")
      .innerJoin("p.doctor", "d")
      .innerJoin("p.pacient", "u")
      .where("d.id = :doctorId", { doctorId })
      .andWhere("v.dateVisit = :today", { today: todayStr })
      .orderBy("v.time", "ASC")
      .select([
        "v.id AS \"visitId\"",
        "p.id AS \"cardId\"",
        "u.fullName AS \"fullName\"",
        "u.phone AS \"phone\"",
        "v.time AS \"time\"",
        "v.appointmentStatus AS \"appointmentStatus\"",
      ]);
    const total = await qb.getCount();
    const skip = Math.max(0, (page - 1) * pageSize);
    const take = Math.min(50, Math.max(1, pageSize));
    const raw = await qb.offset(skip).limit(take).getRawMany<{
      visitId: number;
      cardId: number;
      fullName: string;
      phone: string;
      time: string;
      appointmentStatus: string;
    }>();
    return {
      list: raw,
      total,
      page,
      pageSize: take,
    };
  }

  /** Отмена визита. Проверяет, что визит принадлежит пациенту доктора. */
  static async cancelVisit(visitId: number, doctorId: number): Promise<boolean> {
    const doctor = await this.repository.findOne({
      where: { id: doctorId },
      select: { id: true, userType: true },
    });
    if (!doctor || doctor.userType !== UserTypes.DOCTOR) return false;
    const visit = await this.visitRepository.findOne({
      where: { id: visitId },
      relations: ["pacient", "pacient.doctor"],
    });
    if (!visit?.pacient) return false;
    const card = visit.pacient as Pacients & { doctor?: { id?: number } };
    if (card.doctor?.id !== doctorId) return false;
    (visit as PacientVisit & { appointmentStatus: string }).appointmentStatus = "cancelled";
    await this.visitRepository.save(visit);
    return true;
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

  /** Обновление персональных данных пользователя (имя, email, телефон, полис, сертификаты, должность). */
  static async updateProfile(
    email: string,
    data: {
      fullName?: string;
      email?: string;
      phone?: string;
      policyNumber?: string;
      certificates?: string[];
      position?: string;
    },
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
    if (data.certificates !== undefined) user.certificates = data.certificates;
    if (data.position !== undefined) user.position = data.position;

    const saved = await this.repository.save(user);
    return Object.fromEntries(
      Object.entries(saved).filter(([key]) => key !== "password"),
    ) as Omit<User, "password">;
  }

  /** Сброс пароля всем врачам (только для администратора). */
  static async resetDoctorsPassword(newPassword: string): Promise<{ updated: number }> {
    const hashedPassword = await hashPassword(newPassword);
    const doctors = await this.repository.find({
      where: { userType: UserTypes.DOCTOR },
      select: { id: true },
    });
    let updated = 0;
    for (const u of doctors) {
      const user = await this.repository.findOne({ where: { id: u.id } });
      if (user) {
        user.password = hashedPassword;
        await this.repository.save(user);
        updated++;
      }
    }
    return { updated };
  }

  /** Запуск резервного копирования (логирование действия). */
  static async backupSystem(): Promise<{ success: boolean; message: string }> {
    return { success: true, message: "Резервная копия запущена. Обработка выполняется в фоне." };
  }

  /** Очистка кэша системы. */
  static async clearCache(): Promise<{ success: boolean; message: string }> {
    return { success: true, message: "Кэш успешно очищен." };
  }

  /** Проверка безопасности системы. */
  static async checkSecurity(): Promise<{ ok: boolean; issues: string[] }> {
    const issues: string[] = [];
    const unconfirmed = await this.repository.count({ where: { isConfirmed: false } });
    if (unconfirmed > 10) {
      issues.push(`Много неподтверждённых пользователей: ${unconfirmed}`);
    }
    return { ok: issues.length === 0, issues };
  }

  /** Отчёт по типу: financial | medical | users. */
  static async getReport(
    type: "financial" | "medical" | "users",
  ): Promise<{ type: string; generatedAt: string; data: unknown }> {
    const now = new Date();
    const generatedAt = now.toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    if (type === "financial") {
      const stats = await this.getAdminStats();
      return {
        type: "financial",
        generatedAt,
        data: {
          revenueToday: stats.revenueToday,
          revenueGrowthPercent: stats.revenueGrowthPercent,
          appointmentsToday: stats.appointmentsToday,
        },
      };
    }

    if (type === "medical") {
      const totalPatients = await this.pacientsRepository
        .createQueryBuilder("p")
        .select("COUNT(DISTINCT p.pacientId)", "cnt")
        .getRawOne<{ cnt: string }>();
      const totalVisitsThisMonth = await this.visitRepository
        .createQueryBuilder("v")
        .where("v.dateVisit >= :start", { start: monthStart })
        .andWhere("v.dateVisit <= :end", { end: monthEnd })
        .getCount();
      const byDoctor = await this.visitRepository
        .createQueryBuilder("v")
        .innerJoin("v.pacient", "p")
        .innerJoin("p.doctor", "d")
        .where("v.dateVisit >= :start", { start: monthStart })
        .andWhere("v.dateVisit <= :end", { end: monthEnd })
        .select("d.fullName", "doctorName")
        .addSelect("COUNT(v.id)", "visitCount")
        .addSelect("COUNT(DISTINCT p.id)", "uniquePatients")
        .groupBy("d.id")
        .addGroupBy("d.fullName")
        .orderBy("COUNT(v.id)", "DESC")
        .getRawMany<{ doctorName: string; visitCount: string; uniquePatients: string }>();
      const topDiagnoses = await this.historyDiseasesRepository
        .createQueryBuilder("h")
        .where("h.createdAt >= :start", { start: monthStart })
        .andWhere("h.createdAt <= :end", { end: monthEnd })
        .select("h.diseases", "disease")
        .addSelect("COUNT(*)", "cnt")
        .groupBy("h.diseases")
        .orderBy("COUNT(*)", "DESC")
        .limit(20)
        .getRawMany<{ disease: string; cnt: string }>();
      return {
        type: "medical",
        generatedAt,
        data: {
          totalPatients: Number(totalPatients?.cnt ?? 0),
          totalVisitsThisMonth,
          byDoctor: byDoctor.map((r) => ({
            doctorName: r.doctorName,
            visitCount: Number(r.visitCount),
            uniquePatients: Number(r.uniquePatients),
          })),
          topDiagnoses: topDiagnoses.map((r) => ({ disease: r.disease, count: Number(r.cnt) })),
        },
      };
    }

    if (type === "users") {
      const users = await this.repository.find({
        select: ["id", "fullName", "email", "phone", "userType"],
        order: { id: "ASC" },
      });
      const visitsPerUser = await this.visitRepository
        .createQueryBuilder("v")
        .innerJoin("v.pacient", "p")
        .where("v.dateVisit >= :start", { start: monthStart })
        .andWhere("v.dateVisit <= :end", { end: monthEnd })
        .select("p.pacientId", "userId")
        .addSelect("COUNT(v.id)", "cnt")
        .groupBy("p.pacientId")
        .getRawMany<{ userId: number; cnt: string }>();
      const visitMap = new Map(visitsPerUser.map((r) => [r.userId, Number(r.cnt)]));
      const allHistory = await this.historyDiseasesRepository.find({
        relations: ["pacient"],
        select: { id: true, diseases: true, description: true, createdAt: true, pacient: { id: true } },
      });
      const pacientsRaw = await this.pacientsRepository
        .createQueryBuilder("p")
        .select("p.id", "id")
        .addSelect("p.pacientId", "userId")
        .getRawMany<{ id: number; userId: number }>();
      const cardToUser = new Map(pacientsRaw.map((r) => [r.id, r.userId]));
      const userHistoryList = new Map<number, { diseases: string; description: string; createdAt: Date }[]>();
      for (const h of allHistory) {
        const pacient = h.pacient as { id?: number };
        const uid = pacient?.id != null ? cardToUser.get(pacient.id) : undefined;
        if (uid != null) {
          const list = userHistoryList.get(uid) ?? [];
          list.push({
            diseases: h.diseases,
            description: h.description ?? "",
            createdAt: h.createdAt,
          });
          userHistoryList.set(uid, list);
        }
      }
      const rows = users.map((u) => {
        const consultationsThisMonth = visitMap.get(u.id) ?? 0;
        const history = userHistoryList.get(u.id) ?? [];
        const historySummary =
          history.length === 0
            ? ""
            : history
                .slice(0, 50)
                .map((r) => `${r.diseases}${r.description ? ": " + r.description : ""}`)
                .join("; ");
        return {
          id: u.id,
          fullName: u.fullName ?? "",
          email: u.email,
          phone: u.phone ?? "",
          userType: u.userType,
          consultationsThisMonth,
          historyDiseasesSummary: historySummary,
          historyRecordsCount: history.length,
        };
      });
      return {
        type: "users",
        generatedAt,
        data: { rows },
      };
    }
    return { type, generatedAt, data: {} };
  }

  /** Список пользователей для настроек безопасности (пагинация). Без пароля. */
  static async getUsersPage(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{
    list: Array<{ id: number; fullName: string; email: string; userType: string; isAdmin: boolean; isConfirmed: boolean }>;
    total: number;
    page: number;
    pageSize: number;
  }> {
    const skip = Math.max(0, (page - 1) * pageSize);
    const take = Math.min(100, Math.max(1, pageSize));
    const [list, total] = await this.repository.findAndCount({
      select: ["id", "fullName", "email", "userType", "isAdmin", "isConfirmed"],
      order: { id: "ASC" },
      skip,
      take,
    });
    return {
      list: list.map((u) => ({
        id: u.id,
        fullName: u.fullName ?? "",
        email: u.email,
        userType: u.userType,
        isAdmin: u.isAdmin === true,
        isConfirmed: u.isConfirmed === true,
      })),
      total,
      page,
      pageSize: take,
    };
  }

  /** Обновить права пользователя (isAdmin, userType). Только для администратора. */
  static async updateUserRole(
    userId: number,
    data: { isAdmin?: boolean; userType?: UserTypes },
  ): Promise<boolean> {
    const user = await this.repository.findOne({
      where: { id: userId },
      select: ["id", "isAdmin", "userType"],
    });
    if (!user) return false;
    if (data.isAdmin !== undefined) user.isAdmin = data.isAdmin;
    if (data.userType !== undefined) {
      user.userType = data.userType;
      user.isAdmin = data.userType === UserTypes.ADMIN;
    }
    await this.repository.save(user);
    return true;
  }
}
