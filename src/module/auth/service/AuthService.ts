import { dbSource } from "@/db/data-source.js";

import { RegUserInfo } from "@/module/auth/dto/Auth.dto.js";
import { User } from "@/module/users/entity/User.entity.js";
import { verifyPassword } from "@/utils/other/hash_password.js";
import { generateToken } from "@/utils/other/jwt.js"

export class AuthService {

    private static repository = dbSource.getRepository(User)

    static async login(userData: RegUserInfo) {
        const user = await this.repository.findOne({ where: { email: userData.email }});
        const verifiedUser = await verifyPassword(userData.password, user?.password as string);

        if (verifiedUser) {
            const accessToken = generateToken({email: user?.email}, 'access');
            const refreshToken = generateToken({email: user?.email}, 'refresh');

            return [accessToken, refreshToken];
        }

        return []
    }
}