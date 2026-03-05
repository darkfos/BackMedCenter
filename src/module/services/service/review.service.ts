import { FindOptionsWhere, ILike, Repository } from "typeorm";

import { dbSource } from "@/db/data-source";
import { ReviewEntity } from "@/module/services";
import { User } from "@/module/users";
import { UserTypes } from "@/utils/shared/entities_enums.js";
import type { Review, ReviewFilter } from "@/module/services/dto/Review.dto";

export class ReviewService {
  protected static reviewRepository: Repository<ReviewEntity> =
    dbSource.getRepository(ReviewEntity);
  protected static userRepository: Repository<User> = dbSource.getRepository(User);

  static async create(
    data: Review,
    doctorId: number,
    userEmail: string,
  ): Promise<{ success: true } | { success: false; reason: string }> {
    const user = await this.userRepository.findOne({
      where: { email: userEmail },
      select: ["id", "email", "userType"],
    });
    const doctor = await this.userRepository.findOne({
      where: { id: doctorId },
      select: ["id", "userType"],
    });

    if (!user) {
      return { success: false, reason: "Пользователь не найден" };
    }
    if (!doctor) {
      return { success: false, reason: "Врач не найден" };
    }
    if (doctor.userType !== UserTypes.DOCTOR) {
      return { success: false, reason: "Указанный пользователь не является врачом" };
    }

    const newReview = this.reviewRepository.create({
      message: data.message,
      rating: data.rating,
      user,
      doctor,
    });
    await this.reviewRepository.save(newReview);
    return { success: true };
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

  /** Список отзывов по id врача с пагинацией. */
  static async getByDoctorId(
    doctorId: number,
    page: number = 1,
    pageSize: number = 5,
  ): Promise<{ list: ReviewEntity[]; total: number }> {
    const skip = (Math.max(1, page) - 1) * Math.max(1, Math.min(50, pageSize));
    const take = Math.max(1, Math.min(50, pageSize));

    const [list, total] = await this.reviewRepository.findAndCount({
      where: { doctor: { id: doctorId } },
      relations: ["user"],
      order: { createdAt: "DESC" },
      skip,
      take,
    });
    return { list, total };
  }

  static async setLike(email: string | undefined, reviewId: number): Promise<{ success: true } | { success: false; reason: string }> {
    if (!email) {
      return { success: false, reason: "Требуется авторизация" };
    }

    const user = await this.userRepository.findOne({
      where: { email },
      select: ["id"],
    });

    if (!user) {
      return { success: false, reason: "Пользователь не найден" };
    }

    console.log(user, reviewId, 4328848234);
    const review = await this.reviewRepository.createQueryBuilder('review')
      .select('review.likes')
      .where('review.id = :reviewId', { reviewId })
      .getOne();

    console.log(review);

    if (review?.likes.includes(user?.id.toString())) {
      await this.reviewRepository.update(reviewId, { likes: review.likes.filter((likeId) => +likeId !== user?.id) });
      return { success: true };
    } else {
      await this.reviewRepository.update(reviewId, { likes: [...(review?.likes ?? []), user?.id.toString()] });
      return { success: true };
    }
  }
}
