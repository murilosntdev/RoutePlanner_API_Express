import { dbExecute } from "../database/db.js";

export const selectIdByCnpjEmail = async (cnpj, email) => {
    var query = `SELECT id FROM company WHERE (cnpj = $1) OR (email = $2)`;
    var result = await dbExecute(query, [cnpj, email]);

    if (result.dbError) {
        return (result);
    } else if (!result.rows[0]) {
        return ({ "rows": [] });
    }

    return (result.rows[0]);
}

export const insertAllCompany = async (name, cnpj, email, hashPassword, status) => {
    var query = `INSERT INTO company (name, cnpj, email, password, status) VALUES ($1, $2, $3, $4, $5) RETURNING name, cnpj, status`;
    var result = await dbExecute(query, [name, cnpj, email, hashPassword, status]);

    if (result.dbError) {
        return (result);
    };

    return (result.rows[0]);
}