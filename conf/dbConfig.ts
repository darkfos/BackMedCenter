import { config } from 'dotenv';

config();

class DBConfig {

    private MED_DB_HOST: string = process.env.MED_DB_HOST;
    private MED_DB_PORT: string = process.env.MED_DB_PORT
    private MED_DB_USER: string = process.env.MED_DB_USER;
    private MED_DB_NAME: string = process.env.MED_DB_NAME;
    private MED_DB_PASSWORD: string = process.env.MED_DB_PASSWORD;

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