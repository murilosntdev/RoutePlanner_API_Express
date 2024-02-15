import { dbExecute } from "../database/db.js";

export const selectIdByCnpjEmail = async (cnpj, email) => {
    var query = `SELECT id FROM company WHERE (cnpj = $1) OR (email = $2)`;
    var result = await dbExecute(query, [cnpj, email]);

    return (result);
}

export const insertAllCompany = async (name, cnpj, email, hashPassword, status) => {
    var query = `INSERT INTO company (name, cnpj, email, password, status) VALUES ($1, $2, $3, $4, $5) RETURNING name, cnpj, status`;
    var result = await dbExecute(query, [name, cnpj, email, hashPassword, status]);

    return (result);
}

export const selectIdNameEmailStatusByCnpj = async (cnpj) => {
    var query = `SELECT id, name, email, status FROM company WHERE (cnpj = $1)`;
    var result = await dbExecute(query, [cnpj]);

    return (result);
}

export const selectIdExpirationByCompanyAccount_id = async (account_id) => {
    var query = `SELECT aco.auth_code_id, ac.expiration FROM auth_code_owner aco INNER JOIN auth_code ac ON aco.auth_code_id = ac.id WHERE (aco.company_id = $1) AND (ac.category = 'VALIDATE_ACCOUNT') AND (ac.used = false) ORDER BY ac.id DESC LIMIT 1`;
    var result = await dbExecute(query, [account_id]);

    return (result);
}

export const updateStatusByCompanyId = async (account_id) => {
    var query = `UPDATE company SET status = 'ACTIVE_ACCOUNT' WHERE id = $1 RETURNING status`;
    var result = await dbExecute(query, [account_id]);

    return (result);
}