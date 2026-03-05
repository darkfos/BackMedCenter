import { Repository } from "typeorm";
import { dbSource } from "@/db/data-source.js";
import { NurseTask, NurseTaskPriority, NurseTaskStatus, NurseTaskType } from "@/module/pacients/entity/NurseTask.entity.js";

export type NurseTaskFilter = "all" | "high_priority" | "completed";

export interface CreateNurseTaskBody {
  patientName: string;
  description: string;
  room?: string;
  scheduledTime: string;
  taskDate: string;
  priority?: NurseTaskPriority;
  taskType?: NurseTaskType;
  analysisId?: number | null;
}

export class NurseTaskService {
  private static get repository(): Repository<NurseTask> {
    return dbSource.getRepository(NurseTask);
  }

  static async getByNurseForDate(
    nurseId: number,
    taskDate: string,
    page: number,
    pageSize: number,
    filter: NurseTaskFilter
  ): Promise<{ list: Array<{
    id: number;
    patientName: string;
    description: string;
    room: string | null;
    scheduledTime: string;
    priority: string;
    status: string;
    note: string | null;
    completedAt: string | null;
    taskType: string;
  }>; total: number; page: number; pageSize: number }> {
    const skip = Math.max(0, (page - 1) * pageSize);
    const take = Math.min(50, Math.max(1, pageSize));

    const qb = this.repository
      .createQueryBuilder("t")
      .where("t.nurseId = :nurseId", { nurseId })
      .andWhere("t.taskDate = :taskDate", { taskDate });

    if (filter === "high_priority") {
      qb.andWhere("t.priority = :priority", { priority: "high" });
    } else if (filter === "completed") {
      qb.andWhere("t.status = :status", { status: "completed" });
    }

    const [rows, total] = await qb
      .orderBy("t.scheduledTime", "ASC")
      .addOrderBy("t.id", "ASC")
      .skip(skip)
      .take(take)
      .getManyAndCount();

    const list = rows.map((r) => ({
      id: r.id,
      patientName: r.patientName,
      description: r.description,
      room: r.room,
      scheduledTime: r.scheduledTime,
      priority: r.priority,
      status: r.status,
      note: r.note,
      completedAt: r.completedAt ? (typeof r.completedAt === "string" ? r.completedAt : (r.completedAt as Date).toISOString()) : null,
      taskType: r.taskType,
    }));

    return { list, total, page, pageSize: take };
  }

  static async complete(taskId: number, nurseId: number): Promise<boolean> {
    const task = await this.repository.findOne({
      where: { id: taskId, nurseId },
    });
    if (!task || task.status === "completed") return false;
    task.status = "completed" as NurseTaskStatus;
    task.completedAt = new Date();
    await this.repository.save(task);
    return true;
  }

  static async setNote(taskId: number, nurseId: number, note: string): Promise<boolean> {
    const task = await this.repository.findOne({
      where: { id: taskId, nurseId },
    });
    if (!task) return false;
    task.note = note;
    await this.repository.save(task);
    return true;
  }

  static async create(nurseId: number, body: CreateNurseTaskBody): Promise<NurseTask | null> {
    const task = this.repository.create({
      nurseId,
      patientName: body.patientName,
      description: body.description,
      room: body.room ?? null,
      scheduledTime: body.scheduledTime,
      taskDate: new Date(body.taskDate),
      priority: (body.priority as NurseTaskPriority) ?? "normal",
      status: "pending" as NurseTaskStatus,
      taskType: (body.taskType as NurseTaskType) ?? "procedure",
      analysisId: body.analysisId ?? null,
    });
    return await this.repository.save(task);
  }

  /** Статистика за смену (дата): процедур выполнено, пациентов обслужено, рабочее время в минутах. */
  static async getShiftStats(
    nurseId: number,
    taskDate: string
  ): Promise<{ proceduresCompleted: number; patientsServed: number; workingTimeMinutes: number }> {
    const completed = await this.repository.find({
      where: { nurseId, taskDate: new Date(taskDate), status: "completed" as NurseTaskStatus },
      select: ["patientName", "completedAt"],
    });
    const proceduresCompleted = completed.length;
    const uniquePatients = new Set(completed.map((t) => t.patientName?.trim() || "").filter(Boolean));
    const patientsServed = uniquePatients.size;

    let workingTimeMinutes = 0;
    const withTime = completed.filter((t) => t.completedAt != null) as Array<{ completedAt: Date }>;
    if (withTime.length >= 2) {
      const dates = withTime.map((t) => (t.completedAt instanceof Date ? t.completedAt.getTime() : new Date(t.completedAt).getTime()));
      const min = Math.min(...dates);
      const max = Math.max(...dates);
      workingTimeMinutes = Math.round((max - min) / 60000);
    } else if (withTime.length === 1) {
      workingTimeMinutes = 0;
    }

    return { proceduresCompleted, patientsServed, workingTimeMinutes };
  }

  /** Все задачи за дату (без пагинации) для отчёта/журнала. */
  static async getAllByNurseAndDate(
    nurseId: number,
    taskDate: string
  ): Promise<Array<{
    id: number;
    patientName: string;
    description: string;
    room: string | null;
    scheduledTime: string;
    priority: string;
    status: string;
    completedAt: string | null;
  }>> {
    const rows = await this.repository.find({
      where: { nurseId, taskDate: new Date(taskDate) },
      order: { scheduledTime: "ASC", id: "ASC" },
    });
    return rows.map((r) => ({
      id: r.id,
      patientName: r.patientName,
      description: r.description,
      room: r.room,
      scheduledTime: r.scheduledTime,
      priority: r.priority,
      status: r.status,
      completedAt: r.completedAt
        ? (typeof r.completedAt === "string" ? r.completedAt : (r.completedAt as Date).toISOString())
        : null,
    }));
  }
}
