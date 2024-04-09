import { insertAllCompany, updateStatusByCompanyId } from "../models/Account.js";
import { confirmAuthCode, createAuthCode } from "../services/authCode.js";
import { hideEmail, sendMail } from "../services/email/email.js";
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
    const auth_code = req.body.auth_code;
    const account_id = req.body.account_id;
    const name = req.body.name;
    const email = req.body.email;

    if (action === "create_auth_code") {
        var authCodeResult = await createAuthCode(account_id, account_type, "VALIDATE_ACCOUNT", 6, 5);

        if (authCodeResult.dbError) {
            res.status(503);
            res.json(errorResponse(503, null, authCodeResult));
            return;
        }

        var templateContext = {
            name: name,
            authCode: authCodeResult.rows[0].hash
        };

        var emailResult = await sendMail(email, 'Confirme seu Email', 'activateAccount', templateContext);

        if (emailResult.emailError) {
            res.status(503);
            res.json(errorResponse(503, null, emailResult));
            return;
        }

        const hiddenEmail = hideEmail(emailResult.accepted[0]);

        const responseDetail = {
            "result": `Código de autenticação enviado para ${hiddenEmail}`,
            "account_info": {
                "type": "company",
                "cpf_cnpj": cpf_cnpj
            }
        }

        res.status(201);
        res.json(successResponse(201, responseDetail));
        return;
    } else if (action === "validate_auth_code") {
        var authCodeResult = await confirmAuthCode(account_id, account_type, "VALIDATE_ACCOUNT", auth_code);

        if (authCodeResult.dbError) {
            res.status(503);
            res.json(errorResponse(503, null, authCodeResult));
            return;
        }

        if (authCodeResult === false) {
            res.status(401);
            res.json(errorResponse(401, "Código de autenticação expirado ou inválido"));
            return;
        }

        const updateAccount = await updateStatusByCompanyId(account_id);

        if (updateAccount.dbError) {
            res.status(503);
            res.json(errorResponse(503, null, updateAccount));
            return;
        } else if (updateAccount.rows[0].status === 'ACTIVE_ACCOUNT') {
            const responseDetail = {
                "result": "Conta ativada com sucesso",
                "account_info": {
                    "type": "company",
                    "cpf_cnpj": cpf_cnpj,
                    "status": updateAccount.rows[0].status
                }
            }

            res.status(200);
            res.json(successResponse(200, responseDetail));
            return;
        }
    }
}