import { UserTypes } from "@/utils/shared/entities_enums.js";
import { RegUserInfo } from "@/module/auth";

export interface UserInfo extends RegUserInfo {
  fullName: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  userType: UserTypes;
}
