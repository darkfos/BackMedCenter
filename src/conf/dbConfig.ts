import { config } from "dotenv";

config();

class DBConfig {
  private MED_DB_HOST: string = process.env.MED_DB_HOST ?? "localhost";
  private MED_DB_PORT: number = Number(process.env.MED_DB_PORT) ?? 5432;
  private MED_DB_USER: string = process.env.MED_DB_USER ?? "postgres";
  private MED_DB_NAME: string = process.env.MED_DB_NAME ?? "postgres";
  private MED_DB_PASSWORD: string = process.env.MED_DB_PASSWORD ?? "postgres";

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
