import { ILike, Repository } from "typeorm";
import type { FindOptionsWhere } from "typeorm";

import { dbSource } from "@/db/data-source";
import { User } from "@/module/users";
import { FormatWorks, UserTypes } from "@/utils";
import { ReviewEntity } from "../entity/Review.entity";
import { Pagination } from "@/utils";

export class ServService {
  protected static userRepository: Repository<User> = dbSource.getRepository(User);
  protected static reviewRepository: Repository<ReviewEntity> = dbSource.getRepository(ReviewEntity);
  protected static pagination = new Pagination(10, this.userRepository);

  static async getDoctors(doctorName: string, specialization: string, formatWork: FormatWorks, page: number, pageSize: number) {
    const where: FindOptionsWhere<User> = {
      userType: UserTypes.DOCTOR,
      ...(doctorName && { fullName: ILike(`%${doctorName.toLowerCase()}%`)}),
      ...(formatWork && { formatWork: formatWork }),
      ...(specialization && { clinicType: { name: specialization } })
    };

    const doctors = await this.pagination.getPaginationData(where, {
      clinicType: true,
      doctorReviews: true
    }, page, pageSize)

    return doctors;
  }
}
