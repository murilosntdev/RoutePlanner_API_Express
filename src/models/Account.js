import { dbExecute } from "../database/db.js";

export const selectIdByCnpjEmail = async (cnpj, email) => {
    var query = `SELECT id FROM company WHERE (cnpj = $1) OR (email = $2)`;
    var result = await dbExecute(query, [cnpj, email]);

    if (result.dbError) {
        return (result);
    } else if (!result.rows[0]) {
        return { "rows": [] };
    }

    return result.rows[0];
}