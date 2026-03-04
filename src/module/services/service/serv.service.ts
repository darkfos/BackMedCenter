import { ILike, Repository } from "typeorm";
import type { FindOptionsWhere } from "typeorm";

import { dbSource } from "@/db/data-source";
import { User } from "@/module/users";
import { FormatWorks, UserTypes } from "@/utils/shared/entities_enums.js";
import { ReviewEntity } from "../entity/Review.entity";
import { Pagination } from "@/utils/other/pagination.js";

export class ServService {
  protected static userRepository: Repository<User> = dbSource.getRepository(User);
  protected static reviewRepository: Repository<ReviewEntity> = dbSource.getRepository(ReviewEntity);
  protected static pagination = new Pagination(10, this.userRepository);

  static async getDoctors(doctorName: string, specialization: number, formatWork: FormatWorks, page: number, pageSize: number) {
    const where: FindOptionsWhere<User> = {
      userType: UserTypes.DOCTOR,
      ...(doctorName && { fullName: ILike(`%${doctorName.toLowerCase()}%`)}),
      ...(formatWork && { formatWork: formatWork }),
      ...(specialization && { clinicType: { id: specialization } })
    };

    const doctors = await this.pagination.getPaginationData(where, ['clinicType', 'doctorReviews'], page, pageSize)

    return doctors;
  }

  /** Получение одного врача по id (для публичной детальной страницы). */
  static async getDoctorById(id: number): Promise<User | null> {
    if (Number.isNaN(id)) return null;
    const doctor = await this.userRepository.findOne({
      where: { id, userType: UserTypes.DOCTOR },
      relations: ['clinicType', 'doctorReviews', 'doctorReviews.user'],
    });
    return doctor ?? null;
  }
}
