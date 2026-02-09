import { Repository } from "typeorm";

import { dbSource } from "@/db/data-source";
import { Analyses } from "@/module/analysis";
import { Analysis } from "@/module/analysis/dto/Analysis.dto";

export class AnalysisService {
  private static get repository(): Repository<Analyses> {
    return dbSource.getRepository(Analyses);
  }

  static async getList(
    filters: Pick<Analysis, "type" | "status" | "costs"> | {} = {},
  ) {
    const analysis = await this.repository.findAndCount({
      where: {
        ...filters,
      },
    });

    return analysis;
  }
}
