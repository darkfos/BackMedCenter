declare class DBConfig {
  private MED_DB_HOST;
  private MED_DB_PORT;
  private MED_DB_USER;
  private MED_DB_NAME;
  private MED_DB_PASSWORD;
  get db_host(): string;
  get db_port(): number;
  get db_user(): string;
  get db_name(): string;
  get db_password(): string;
}
export declare const dbConfig: DBConfig;
export {};
//# sourceMappingURL=dbConfig.d.ts.map
