export enum UserTypes {
  DOCTOR = "doctor",
  PACIENT = "pacient",
  REGISTER = "register",
  MANAGER = "manager",
}

export enum FormatWorks {
  OCH = "och",
  ZOCH = "zoch",
  OTHER = "other",
}

export enum VisitType {
  VISIT = "visit",
  NOTVISIT = "notvisit",
}

export enum NewsTypes {
  GENERAL = "GENERAL",
  MED = "MED",
  SOCIAL = "SOCIAL",
  EVENTS = "EVENTS",
  CONFERENCE = "CONFERENCE",
  PERSONAL = "PERSONAL",
}

export enum StatusPacient {
  HEALTHY = "HEALTHY",
  SICK = "SICK",
  DEAD = "DEAD",
  UNDEFINED = "UNDEFINED",
  REMISSION = "REMISSION",
}

export enum NewsTranslateTypes {
  GENERAL = "главная",
  MED = "здоровье",
  SOCIAL = "социальные",
  EVENTS = "события",
  CONFERENCE = "достижения",
  PERSONAL = "новости персонала",
}

export enum FormatTranslateWorks {
  "OCH" = "очно",
  "ZOCH" = "заочно",
  "OTHER" = "очно, заочно",
}

/** Статус записи в медицинской истории: активно / завершено */
export enum HistoryRecordStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
}

/** Статус приёма к врачу */
export enum AppointmentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
}
