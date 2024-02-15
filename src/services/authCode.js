import * as crypto from "crypto";
import { dbExecute } from "../database/db.js";

export const createAuthCode = async (account_id, account_type, category, hashSize, expirationInMinutes) => {
    const hash = crypto.randomBytes(hashSize).toString("base64").slice(0, hashSize);

    var expiration = new Date();
    expiration.setTime(expiration.getTime() + expirationInMinutes * 60 * 1000);

    var query1 = `INSERT INTO auth_code (category, hash, expiration) VALUES ($1, $2, $3) RETURNING id, hash`;
    var result1 = await dbExecute(query1, [category, hash, expiration]);

    if (result1.dbError) {
        return result1;
    }

    if (account_type === "company") {
        var query2 = `INSERT INTO auth_code_owner (auth_code_id, account_type, company_id) VALUES ($1, $2, $3) RETURNING auth_code_id`;
    }

    var result2 = await dbExecute(query2, [result1.rows[0].id, account_type, account_id]);

    if (result2.dbError) {
        return result2;
    }

    return result1;
}

export const confirmAuthCode = async (account_id, account_type, category, authCode) => {
    if (account_type === "company") {
        var query1 = `SELECT aco.auth_code_id, ac.hash FROM auth_code_owner aco INNER JOIN auth_code ac ON aco.auth_code_id = ac.id WHERE (aco.company_id = $1) AND (ac.category = $2) AND (ac.used = false) ORDER BY ac.id DESC LIMIT 1`;
    }

    var result1 = await dbExecute(query1, [account_id, category]);

    if (result1.dbError) {
        return result1;
    }

    if (result1.rows[0].hash === authCode) {
        var query2 = `UPDATE auth_code SET used = true WHERE id = $1 RETURNING used`;
        var result2 = await dbExecute(query2, [result1.rows[0].auth_code_id]);

        if (result2.dbError) {
            return result2;
        }

        return (result2.rows[0].used);
    }

    return (false);
}