import { insertAllCompany } from "../models/Account.js";
import { createAuthCode } from "../services/authCode.js";
import { errorResponse } from "../services/responses/error.response.js";
import { successResponse } from "../services/responses/success.response.js";
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
        "result": `Companhia '${insertInfos.rows[0].name}' criada com sucesso`,
        "account_info": {
            "type": "company",
            "cnpj": insertInfos.rows[0].cnpj,
            "status": insertInfos.rows[0].status
        }
    };

    res.status(201);
    res.json(successResponse(201, responseDetail));
    return;
}

export const activate = async (req, res) => {
    const action = req.body.action;
    const account_type = req.body.account_type;
    const cpf_cnpj = req.body.cpf_cnpj;
    const account_id = req.body.account_id;

    if (action === "create_auth_code") {
        if (account_type === "company") {
            var authCodeResult = await createAuthCode(account_id, account_type, "VALIDATE_ACCOUNT", 6, 5);

            if (authCodeResult.dbError) {
                res.status(503);
                res.json(errorResponse(503, null, authCodeResult));
                return;
            }

            console.log("token criado");
        }
    }
}