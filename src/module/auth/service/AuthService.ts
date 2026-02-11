import { dbSource } from "@/db/data-source.js";
import { Repository } from "typeorm";

import { RegUserInfo } from "@/module/auth";
import { User } from "@/module/users";
import { verifyPassword } from "@/utils";
import { generateToken, TokenType, verifyToken } from "@/utils";

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
    });
    const verifiedUser = await verifyPassword(
      userData.password,
      user?.password as string,
    );

    if (verifiedUser) {
      const accessToken = generateToken({ email: user?.email }, "access");
      const refreshToken = generateToken({ email: user?.email }, "refresh");

      return [accessToken, refreshToken];
    }

    return [];
  }

  static verifyMe(token: string, tokenType: TokenType = "access"): boolean {
    return !!verifyToken(token, tokenType);
  }
}
