import { insertAllCompany } from "../models/Account.js";
import { errorResponse } from "../services/responses.js/error.response.js";
import { successResponse } from "../services/responses.js/success.response.js";
import * as bcrypt from "bcrypt";

export const newCompany = async (req, res) => {
    const name = req.body.name;
    const cnpj = req.body.cnpj;
    const email = req.body.email;
    const password = req.body.password;

    const hashPassword = bcrypt.hashSync(password, 10);

    const insertInfos = await insertAllCompany(name, cnpj, email, hashPassword, "NEW_ACCOUNT");

    if (insertInfos.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, insertInfos));
        return;
    }

    const responseDetail = {
        "result": `Companhia '${insertInfos.name}' criada com sucesso`,
        "account_info": {
            "type": "company",
            "cnpj": insertInfos.cnpj,
            "status": insertInfos.status
        }
    };

    res.status(201);
    res.json(successResponse(201, responseDetail));
    return;
}