import { NewsTypes } from "@/utils";

export interface News {
  title: string;
  description: string;
  type: NewsTypes;
  userid?: number;
}

export interface NewsFilter extends News {
  createDate?: Date;
  updateDate?: Date;
}
