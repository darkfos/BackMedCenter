import { config } from "dotenv";
config();
class DBConfig {
  MED_DB_HOST = process.env.MED_DB_HOST ?? "localhost";
  MED_DB_PORT = Number(process.env.MED_DB_PORT) ?? 5432;
  MED_DB_USER = process.env.MED_DB_USER ?? "postgres";
  MED_DB_NAME = process.env.MED_DB_NAME ?? "postgres";
  MED_DB_PASSWORD = process.env.MED_DB_PASSWORD ?? "postgres";
  get db_host() {
    return this.MED_DB_HOST;
  }
  get db_port() {
    return this.MED_DB_PORT;
  }
  get db_user() {
    return this.MED_DB_USER;
  }
  get db_name() {
    return this.MED_DB_NAME;
  }
  get db_password() {
    return this.MED_DB_PASSWORD;
  }
}
export const dbConfig = new DBConfig();
//# sourceMappingURL=dbConfig.js.map
