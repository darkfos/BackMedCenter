import { config } from 'dotenv';

config();

class ApiConfig {

    private ACCESS_TOKEN_KEY: string = process.env.ACCESS_TOKEN_KEY ?? 'access-token';
    private REFRESH_TOKEN_KEY: string = process.env.REFRESH_TOKEN_KEY ?? 'refresh-token';
    private EXPIRE_ACCESS_TOKEN: number = Number(process.env.ACCESS_EXPIRE_TIME_LIFE) ?? 30;
    private EXPIRE_REFRESH_TOKEN: number = Number(process.env.REFRESH_EXPIRE_TIME_LIFE) ?? 30;
    private ALGORITHM: string = process.env.ALGORITHM ?? 'HS256';

    get access_token() {
        return this.ACCESS_TOKEN_KEY;
    }

    get refresh_token() {
        return this.REFRESH_TOKEN_KEY
    }

    get access_expire() {
        return this.EXPIRE_ACCESS_TOKEN;
    }

    get refresh_expire() {
        return this.EXPIRE_REFRESH_TOKEN;
    }

    get algorithm() {
        return this.ALGORITHM;
    }
}


export const apiConfig = new ApiConfig();