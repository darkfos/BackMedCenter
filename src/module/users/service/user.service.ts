import { Repository } from "typeorm";

import { dbSource } from "@/db/data-source.js";
import { User } from "@/module/users";
import { RegUserInfo } from "@/module/auth";
import { hashPassword } from "@/utils/";

export class UserService {
  private static get repository(): Repository<User> {
    return dbSource.getRepository(User);
  }

  static async createUser(userData: RegUserInfo): Promise<User> {
    const newHashedPassword = await hashPassword(userData.password);
    userData.password = newHashedPassword;

    const repository: Repository<User> = dbSource.getRepository(User);
    const newUser = await repository.create(userData);

    return await repository.save(newUser);
  }

  static async getUserByEmail(email: string): Promise<Omit<User, "password">> {
    const user = await this.repository.findOne({ where: { email } });

    return Object.fromEntries(
      Object.entries(user as User).filter(
        ([key, _]) => !["password"].includes(key),
      ),
    ) as Omit<User, "password">;
  }

  static async updatePassword(email: string, newPassword: string) {
    const hashedPassword = await hashPassword(newPassword);
    const user = await this.repository.findOne({ where: { email } });

    if (user) {
      user.password = hashedPassword;
      await this.repository.save(user);
      return true;
    }

    return false;
  }
}
