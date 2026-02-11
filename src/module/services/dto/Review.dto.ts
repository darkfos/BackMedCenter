import { User } from "@/module/users";

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