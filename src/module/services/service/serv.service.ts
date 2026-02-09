import { Repository } from "typeorm";

import { dbSource } from "@/db/data-source";
import { Service } from "@/module/services";

export class ServService {
  protected static servRepository: Repository<Service> =
    dbSource.getRepository(Service);
}
