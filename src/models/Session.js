import { dbExecute } from "../database/db.js";

export const selectIdNameEmailPasswordStatusByCnpj = async (cnpj) => {
    var query = `SELECT id, name, email, password, status FROM company WHERE (cnpj = $1)`;
    var result = await dbExecute(query, [cnpj]);

    return (result);
}

export const selectIdExpirationByCompanyAccount_id = async (account_id) => {
    var query = `SELECT aco.auth_code_id, ac.expiration FROM auth_code_owner aco INNER JOIN auth_code ac ON aco.auth_code_id = ac.id WHERE (aco.company_id = $1) AND (ac.category = 'LOGIN') AND (ac.used = false) ORDER BY ac.id DESC LIMIT 1`;
    var result = await dbExecute(query, [account_id]);

    return (result);
}

export const updateLastAccessByCnpj = async (cnpj) => {
    var actualTime = new Date()
    actualTime.setTime(actualTime.getTime());

    var query = `UPDATE company SET last_access = $1 WHERE cnpj = $2 RETURNING last_access`;
    var result = await dbExecute(query, [actualTime, cnpj]);

    return (result);
}

export const revokeRefreshToken = async (account_id, account_type) => {
    if (account_type === "company") {
        var query = `UPDATE refresh_token SET revoked = true WHERE (id IN (SELECT refresh_token_id FROM refresh_token_owner WHERE account_type = $1 AND company_id = $2)) AND revoked = false`;
    }

    var result = await dbExecute(query, [account_type, account_id]);

    return (result);
}

export const createRefreshToken = async (account_id, account_type, token) => {
    var expiration = new Date();
    expiration.setTime(expiration.getTime() + 12 * 60 * 60 * 1000);

    var query1 = `INSERT INTO refresh_token (token, expiration) VALUES ($1, $2) RETURNING id, token`;
    var result1 = await dbExecute(query1, [token, expiration]);

    if (result1.dbError) {
        return result1;
    }

    if (account_type === "company") {
        var query2 = `INSERT INTO refresh_token_owner (refresh_token_id, account_type, company_id) VALUES ($1, $2, $3) RETURNING refresh_token_id`;
    }

    var result2 = await dbExecute(query2, [result1.rows[0].id, account_type, account_id]);

    if (result2.dbError) {
        return result2;
    }

    return result1;
}

export const selectIdAccountTypeCompanyIdExpirationByToken = async (refresh_token) => {
    var query = `SELECT rt.id, rto.account_type, rto.company_id, rt.expiration FROM refresh_token rt INNER JOIN refresh_token_owner rto ON rt.id = rto.refresh_token_id WHERE rt."token" = $1 AND rt.revoked = false`;
    var result = await dbExecute(query, [refresh_token]);

    return (result);
}

export const selectCnpjStatusByAccountId = async (account_id) => {
    var query = `SELECT cnpj, status FROM company WHERE id = $1`;
    var result = await dbExecute(query, [account_id]);

    return (result);
}

export const selectCnpjByAccountId = async (account_id) => {
    var query = `SELECT cnpj FROM company WHERE id = $1`;
    var result = await dbExecute(query, [account_id]);

    return (result);
}