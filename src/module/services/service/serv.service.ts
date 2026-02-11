import { ILike, Repository } from "typeorm";

import { dbSource } from "@/db/data-source";
import { User } from "@/module/users";
import { UserTypes } from "@/utils";

export class ServService {
  protected static userRepository: Repository<User> = dbSource.getRepository(User);

  static async getDoctors(doctorName: string, specialization: string) : Promise<[User[], number]> {
    const doctors = await this.userRepository.findAndCount({
      where: {
        userType: UserTypes.DOCTOR,
        fullName: ILike(`%${(doctorName ?? "").toLowerCase()}%`),
      }
    });

    return doctors;
  }
}
