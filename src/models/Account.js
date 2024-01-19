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