import { FindOptionsWhere, ILike, Repository } from "typeorm";

import { dbSource } from "@/db/data-source";
import { ReviewEntity } from "@/module/services";
import { User, UserService } from "@/module/users";
import { UserTypes } from "@/utils/shared/entities_enums.js";
import type { Review, ReviewFilter } from "@/module/services/dto/Review.dto";

export class ReviewService {
  protected static reviewRepository: Repository<ReviewEntity> =
    dbSource.getRepository(ReviewEntity);
  protected static userRepository: Repository<User> = dbSource.getRepository(User);

  static async create(data: Review, doctorId: number, userEmail: string): Promise<boolean> {

    const user = await UserService.getUserByEmail(userEmail);
    const doctor = await this.userRepository.findOne({ where: { id: doctorId }})

    if (user && doctor && doctor.userType === UserTypes.DOCTOR) {
      const newReview = await this.reviewRepository.create({...data, user, doctor});
      await this.reviewRepository.save(newReview);
      return true;
    }

    return false;
  }

  static async all(filters: ReviewFilter): Promise<[ReviewEntity[], number]> {
    const activeFilters: FindOptionsWhere<ReviewFilter> = {};

    if (filters.message) {
      activeFilters.message = ILike(`%${filters.message}`);
    }
    if (filters.rating) {
      activeFilters.rating = filters.rating;
    }

    const reviews = await this.reviewRepository.findAndCount({
      where: {
        ...activeFilters
      }
    })

    return reviews;
  }
}
