import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

var pool = '';

if (process.env.SYSTEM_ENVIRONMENT === "staging") {
    pool = new pg.Pool({
        user: process.env.POSTGRE_USER,
        host: process.env.POSTGRE_HOST,
        database: process.env.POSTGRE_DATABASE,
        password: process.env.POSTGRE_PASSWORD,
        port: process.env.POSTGRE_PORT
    });
} else if (process.env.SYSTEM_ENVIRONMENT === "production") {
    pool = new pg.Pool({
        user: process.env.POSTGRE_USER,
        host: process.env.POSTGRE_HOST,
        database: process.env.POSTGRE_DATABASE,
        password: process.env.POSTGRE_PASSWORD,
        port: process.env.POSTGRE_PORT,
        ssl: {
            rejectUnauthorized: false
        }
    });
};

export const dbExecute = (query, params = []) => {
    return new Promise((response) => {
        pool.query(query, params, (error, result) => {
            if (error) {
                const errorContent = {};
                errorContent.dbError = error;
                response(errorContent);
            } else {
                response(result);
            }
        });
    });
};