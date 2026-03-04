import { Repository } from "typeorm";
import { dbSource } from "@/db/data-source.js";
import { Activity } from "@/module/activities/entity/Activity.entity.js";

export type ActivityListItem = {
  id: number;
  eventType: string;
  user: string;
  time: string;
  createdAt: string;
};

export class ActivityService {
  private static get repository(): Repository<Activity> {
    return dbSource.getRepository(Activity);
  }

  /** Записать событие в лог активности. userId = null для системных событий. */
  static async log(eventType: string, userId: number | null = null): Promise<Activity> {
    const activity = this.repository.create({ eventType, userId });
    return await this.repository.save(activity);
  }

  /** Последние события (для блока «Активность системы»). */
  static async getRecent(limit: number = 10): Promise<ActivityListItem[]> {
    const list = await this.repository.find({
      relations: ["user"],
      order: { createdAt: "DESC" },
      take: Math.min(50, Math.max(1, limit)),
    });
    return list.map((a) => ({
      id: a.id,
      eventType: a.eventType,
      user: a.user?.fullName ?? "Система",
      time: formatActivityTime(a.createdAt),
      createdAt: a.createdAt.toISOString(),
    }));
  }

  /** Список с пагинацией (для «Показать всю активность»). */
  static async getList(
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ list: ActivityListItem[]; total: number; page: number; pageSize: number }> {
    const skip = Math.max(0, (page - 1) * pageSize);
    const take = Math.min(100, Math.max(1, pageSize));

    const [list, total] = await this.repository.findAndCount({
      relations: ["user"],
      order: { createdAt: "DESC" },
      skip,
      take,
    });

    return {
      list: list.map((a) => ({
        id: a.id,
        eventType: a.eventType,
        user: a.user?.fullName ?? "Система",
        time: formatActivityTime(a.createdAt),
        createdAt: a.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize: take,
    };
  }
}

function formatActivityTime(d: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dDate = new Date(d);
  const dDay = new Date(dDate.getFullYear(), dDate.getMonth(), dDate.getDate());

  const timeStr = dDate.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (dDay.getTime() === today.getTime()) {
    return timeStr;
  }
  if (dDay.getTime() === yesterday.getTime()) {
    return `Вчера ${timeStr}`;
  }
  return dDate.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
