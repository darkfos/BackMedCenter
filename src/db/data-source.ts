import { DataSource } from "typeorm";
import * as path from "node:path";

import { dbConfig } from "@/conf/dbConfig.js";

export const dbSource = new DataSource({
  type: "postgres",
  host: dbConfig.db_host,
  port: dbConfig.db_port,
  username: dbConfig.db_user,
  password: dbConfig.db_password,
  database: dbConfig.db_name,
  synchronize: false,
  logging: true,
  entities: [path.join(process.cwd(), "dist/src/module/**/*.js")],
  subscribers: [],
  migrations: [path.join(process.cwd(), "dist/src/db/migrations/*.js")],
  migrationsTableName: "migrations",
});
