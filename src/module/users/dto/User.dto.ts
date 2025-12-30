import { UserTypes } from "@/utils";
import { RegUserInfo } from "@/module/auth";

export interface UserInfo extends RegUserInfo {
  fullName: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  userType: UserTypes;
}
