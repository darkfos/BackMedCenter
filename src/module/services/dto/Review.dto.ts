import { User } from "@/module/users";
import { IsNumber, IsNotEmpty } from "class-validator";

export interface Review {
  message: string;
  rating: number;
  user?: typeof User;
  doctor?: typeof User;
}

export interface ReviewFilter {
  message?: string;
  rating?: number;
}

export class ReviewLikeDTO {
  @IsNotEmpty()
  reviewId!: number;
}