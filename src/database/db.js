import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
    user: process.env.POSTGRE_USER,
    host: process.env.POSTGRE_HOST,
    database: process.env.POSTGRE_DATABASE,
    password: process.env.POSTGRE_PASSWORD,
    port: process.env.POSTGRE_PORT
});

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