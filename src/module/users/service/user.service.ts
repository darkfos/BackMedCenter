import { Repository } from "typeorm";

import { dbSource } from "@/db/data-source.js";
import { User } from "@/module/users/entity/User.entity.js";
import { RegUserInfo } from "@/module/auth/dto/Auth.dto.js";
import { hashPassword } from "@/utils/other/hash_password.js";

export class UserService {
  protected static repository: Repository<User> = dbSource.getRepository(User);

  static async createUser(userData: RegUserInfo): Promise<User> {
    const newHashedPassword = await hashPassword(userData.password);
    userData.password = newHashedPassword;

    const repository: Repository<User> = dbSource.getRepository(User);
    const newUser = await repository.create(userData);

    return await repository.save(newUser);
  }

  static async getUserByEmail(email: string) {
    const user = await this.repository.findOne({ where: { email } });

    return Object.fromEntries(
        Object.entries(user as User).filter(([key, value]) => !['password'].includes(key))
    );
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
