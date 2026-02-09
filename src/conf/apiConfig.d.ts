declare class ApiConfig {
  private PORT;
  private ACCESS_TOKEN_KEY;
  private REFRESH_TOKEN_KEY;
  private EXPIRE_ACCESS_TOKEN;
  private EXPIRE_REFRESH_TOKEN;
  private ALGORITHM;
  get port(): number;
  get access_token(): string;
  get refresh_token(): string;
  get access_expire(): number;
  get refresh_expire(): number;
  get algorithm(): string;
}
export declare const apiConfig: ApiConfig;
export {};
//# sourceMappingURL=apiConfig.d.ts.map
