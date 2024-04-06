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