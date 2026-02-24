import { Repository } from "typeorm";
import { dbSource } from "@/db/data-source.js";
import { PacientVisit } from "@/module/pacients/entity/PacientVisits.entity.js";
import { User } from "@/module/users";
import { AppointmentStatus } from "@/utils/shared/entities_enums.js";

const WEEKDAY_TO_RU: Record<number, string> = {
  0: "вс",
  1: "пн",
  2: "вт",
  3: "ср",
  4: "чт",
  5: "пт",
  6: "сб",
};

const SLOT_MINUTES = 30;

/** Парсит "8:00 - 17:00" в [startMinutes, endMinutes] от полуночи */
function parseSchedule(scheduleWork: string): { start: number; end: number } {
  const match = scheduleWork.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) {
    return { start: 8 * 60, end: 17 * 60 };
  }
  const sh = Number(match[1] ?? 8);
  const sm = Number(match[2] ?? 0);
  const eh = Number(match[3] ?? 17);
  const em = Number(match[4] ?? 0);
  return {
    start: sh * 60 + sm,
    end: eh * 60 + em,
  };
}

/** Генерирует слоты с шагом SLOT_MINUTES между start и end (end не включается) */
function timeSlotsBetween(startMinutes: number, endMinutes: number): string[] {
  const slots: string[] = [];
  for (let m = startMinutes; m < endMinutes; m += SLOT_MINUTES) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
  }
  return slots;
}

export type AvailableSlotsResult = {
  date: string;
  slots: string[];
};

export type AvailableDatesWithSlotsResult = {
  available: AvailableSlotsResult[];
};

function parseDate(dateStr: string): Date | null {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const y = parts[0] as number;
  const m = parts[1] as number;
  const d = parts[2] as number;
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  )
    return null;
  return date;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export class DoctorAvailabilityService {
  private static get visitRepository(): Repository<PacientVisit> {
    return dbSource.getRepository(PacientVisit);
  }

  private static get userRepository(): Repository<User> {
    return dbSource.getRepository(User);
  }

  /**
   * Список всех доступных дат в диапазоне [from, to] с вложенными свободными слотами.
   * Только даты, когда доктор работает (dayWork) и есть хотя бы один свободный час.
   */
  static async getAvailableDatesWithSlots(
    doctorId: number,
    fromStr: string,
    toStr: string,
  ): Promise<AvailableDatesWithSlotsResult | null> {
    const doctor = await this.userRepository.findOne({
      where: { id: doctorId },
      select: ["id", "dayWork", "scheduleWork"],
    });
    if (!doctor) return null;

    const fromDate = parseDate(fromStr);
    const toDate = parseDate(toStr);
    if (!fromDate || !toDate || fromDate > toDate) return null;

    const schedule = parseSchedule(doctor.scheduleWork ?? "8:00 - 17:00");
    const allSlotsTemplate = timeSlotsBetween(schedule.start, schedule.end);
    const days = (doctor.dayWork as { days?: string[] })?.days ?? ["пн"];

    const occupiedRows = await this.visitRepository
      .createQueryBuilder("v")
      .select("v.dateVisit", "date")
      .addSelect("v.time", "time")
      .innerJoin("v.pacient", "p")
      .where("p.doctorId = :doctorId", { doctorId })
      .andWhere("v.dateVisit >= :from", { from: fromDate })
      .andWhere("v.dateVisit <= :to", { to: toDate })
      .andWhere("v.appointmentStatus IN (:...statuses)", {
        statuses: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
      })
      .getRawMany<{ date: Date | string; time: string }>();

    const occupiedByDate = new Map<string, Set<string>>();
    for (const row of occupiedRows) {
      const dateVal = row.date;
      const d =
        typeof dateVal === "string"
          ? dateVal.slice(0, 10)
          : formatDate(dateVal as Date);
      if (!occupiedByDate.has(d)) occupiedByDate.set(d, new Set());
      occupiedByDate.get(d)!.add(row.time);
    }

    const available: AvailableSlotsResult[] = [];
    const cursor = new Date(fromDate.getTime());

    while (cursor <= toDate) {
      const dateStr = formatDate(cursor);
      const weekday = cursor.getDay();
      const dayRu = WEEKDAY_TO_RU[weekday] ?? "пн";
      if (!days.includes(dayRu)) {
        cursor.setDate(cursor.getDate() + 1);
        continue;
      }

      const occupied = occupiedByDate.get(dateStr);
      const slots = allSlotsTemplate.filter((t) => !occupied?.has(t));
      if (slots.length > 0) {
        available.push({ date: dateStr, slots });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return { available };
  }
}
