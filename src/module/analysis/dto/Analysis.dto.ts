import { StatusPacient } from "@/utils";

export interface Analysis {
  id: number;
  type: string;
  text: string;
  status: StatusPacient;
  assignedDate: Date;
  takenDate: Date;
  readyDate: Date;
  results: Record<string, any>;
  costs: number;
  updatedAt: Date;
  createdAt: Date;
}
