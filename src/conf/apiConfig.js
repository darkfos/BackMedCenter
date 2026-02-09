import { config } from "dotenv";
config();
class ApiConfig {
  PORT = 8088;
  ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_KEY ?? "access-token";
  REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY ?? "refresh-token";
  EXPIRE_ACCESS_TOKEN = Number(process.env.ACCESS_EXPIRE_TIME_LIFE) ?? 30;
  EXPIRE_REFRESH_TOKEN = Number(process.env.REFRESH_EXPIRE_TIME_LIFE) ?? 30;
  ALGORITHM = process.env.ALGORITHM ?? "HS256";
  get port() {
    return this.PORT;
  }
  get access_token() {
    return this.ACCESS_TOKEN_KEY;
  }
  get refresh_token() {
    return this.REFRESH_TOKEN_KEY;
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
//# sourceMappingURL=apiConfig.js.map
