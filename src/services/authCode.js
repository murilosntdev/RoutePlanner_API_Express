import * as crypto from "crypto";
import { dbExecute } from "../database/db.js";

export const createAuthCode = async (account_id, account_type, category, hashSize, expirationInMinutes) => {
    const hash = crypto.randomBytes(hashSize).toString("base64").slice(0, hashSize);

    var expiration = new Date();
    expiration.setTime(expiration.getTime() + expirationInMinutes * 60 * 1000);

    var query1 = `INSERT INTO auth_code (category, hash, expiration) VALUES ($1, $2, $3) RETURNING id`;
    var result1 = await dbExecute(query1, [category, hash, expiration]);

    if (result1.dbError) {
        return result1;
    }

    if (account_type === "company") {
        var query2 = `INSERT INTO auth_code_owner (auth_code_id, account_type, company_id) VALUES ($1, $2, $3) RETURNING auth_code_id`;
    }

    var result2 = await dbExecute(query2, [result1.rows[0].id, account_type, account_id]);

    return result2;
}