import { dbSource } from "@/db/data-source.js";
import { Repository } from "typeorm";

import { RegUserInfo } from "@/module/auth";
import { User, UserService } from "@/module/users";
import { verifyPassword } from "@/utils/other/hash_password.js";
import { generateToken, verifyToken } from "@/utils/other/jwt.js";
import type { TokenType } from "@/utils/other/jwt.js";

export class AuthService {
  private static get repository(): Repository<User> {
    return dbSource.getRepository(User);
  }

  static async userIsAdmin(email: string) {
    const user = (await this.repository.findOne({ where: { email } })) as User;

    if (user) {
      return user;
    }

    return false;
  }

  static async login(userData: RegUserInfo) {
    const user = await this.repository.findOne({
      where: { email: userData.email },
      select: { id: true, email: true, password: true, isConfirmed: true },
    });
    if (!user?.password) {
      return [];
    }
    const verifiedUser = await verifyPassword(userData.password, user.password);

    if (verifiedUser && user.isConfirmed) {
      const accessToken = generateToken({ email: user.email }, "access");
      const refreshToken = generateToken({ email: user.email }, "refresh");

      return [accessToken, refreshToken];
    }

    return [];
  }

  static verifyMe(token: string, tokenType: TokenType = "access"): boolean {
    return !!verifyToken(token, tokenType);
  }

  /** Смена пароля по email текущего пользователя. */
  static async changePassword(email: string, newPassword: string): Promise<boolean> {
    return UserService.updatePassword(email, newPassword);
  }
}
