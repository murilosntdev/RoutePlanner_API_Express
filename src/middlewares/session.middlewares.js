import { selectIdNameEmailPasswordStatusByCnpj, selectIdExpirationByCompanyAccount_id } from "../models/Session.js";
import { confirmAuthCode } from "../services/authCode.js";
import { errorResponse } from "../services/responses/error.response.js";
import { validateAuthCode } from "../services/validators/authCode.validator.js";
import { validateCnpj } from "../services/validators/docNumber.validator.js";
import { validateStringField } from "../services/validators/fieldFormat.validator.js";
import { validatePassword } from "../services/validators/password.validator.js";
import * as bcrypt from "bcrypt";

export const validatePreLoginInput = (req, res, next) => {
    const account_type = req.body.account_type;
    const cpf_cnpj = req.body.cpf_cnpj;
    const password = req.body.password;

    var inputErrors = [];

    if (!account_type) {
        inputErrors.push({ account_type: "O campo 'account_type' é obrigatório" });
    } else {
        var validAccountType = validateStringField(account_type, 'account_type');
        if (validAccountType != 'validString') {
            inputErrors.push(validAccountType);
        } else if (account_type != "company") {
            inputErrors.push({ account_type: "O campo 'account_type' deve conter um valor válido" });
        }
    }

    if (!cpf_cnpj) {
        inputErrors.push({ cpf_cnpj: "O campo 'cpf_cnpj' é obrigatório" });
    } else {
        if (account_type === "company") {
            var validCpfCnpj = validateCnpj(cpf_cnpj, "cpf_cnpj");
            if (validCpfCnpj != 'validCnpj') {
                inputErrors.push(validCpfCnpj);
            }
        }
    }

    if (!password) {
        inputErrors.push({ password: "O campo 'password' é obrigatório" });
    } else {
        var validPassword = validatePassword(password, 'password');
        if (validPassword != 'validPassword') {
            inputErrors.push(validPassword);
        }
    }

    if (inputErrors.length > 0) {
        res.status(422);
        res.json(errorResponse(422, inputErrors));
        return;
    }

    next();
}

export const checkPreLoginPreviousConditions = async (req, res, next) => {
    const account_type = req.body.account_type;
    const cpf_cnpj = req.body.cpf_cnpj;
    const password = req.body.password;

    var userPassword = '';

    if (account_type === "company") {
        const checkCompanyAccountExistence = await selectIdNameEmailPasswordStatusByCnpj(cpf_cnpj);

        if (checkCompanyAccountExistence.dbError) {
            res.status(503);
            res.json(errorResponse(503, null, checkCompanyAccountExistence));
            return;
        } else if (!checkCompanyAccountExistence.rows[0] || (checkCompanyAccountExistence.rows[0].status !== 'ACTIVE_ACCOUNT' && checkCompanyAccountExistence.rows[0].status !== 'NEW_ACCOUNT')) {
            res.status(403);
            res.json(errorResponse(403, "CNPJ e/ou senha incorretos"));
            return;
        } else if (checkCompanyAccountExistence.rows[0].status === "NEW_ACCOUNT") {
            res.status(400);
            res.json(errorResponse(400, "A conta informada não está ativa"));
            return;
        }

        req.body.account_id = checkCompanyAccountExistence.rows[0].id;
        req.body.name = checkCompanyAccountExistence.rows[0].name;
        req.body.email = checkCompanyAccountExistence.rows[0].email;
        userPassword = checkCompanyAccountExistence.rows[0].password;
    }

    const passwordCompareResult = bcrypt.compareSync(password, userPassword);

    if (passwordCompareResult !== true) {
        res.status(403);
        res.json(errorResponse(403, "CNPJ e/ou senha incorretos"));
        return;
    }

    const checkAuthCode = await selectIdExpirationByCompanyAccount_id(req.body.account_id);

    if (checkAuthCode.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, checkAuthCode));
        return;
    }

    var actualTime = new Date()
    actualTime.setTime(actualTime.getTime());

    if (checkAuthCode.rows[0] && checkAuthCode.rows[0].expiration > actualTime) {
        res.status(400);
        res.json(errorResponse(400, "Ainda existe um código de autenticação ativo para a conta informada"));
        return;
    }

    next();
}

export const validateLoginInput = (req, res, next) => {
    const account_type = req.body.account_type;
    const cpf_cnpj = req.body.cpf_cnpj;
    const password = req.body.password;
    const auth_code = req.body.auth_code;

    var inputErrors = [];

    if (!account_type) {
        inputErrors.push({ account_type: "O campo 'account_type' é obrigatório" });
    } else {
        var validAccountType = validateStringField(account_type, 'account_type');
        if (validAccountType != 'validString') {
            inputErrors.push(validAccountType);
        } else if (account_type != "company") {
            inputErrors.push({ account_type: "O campo 'account_type' deve conter um valor válido" });
        }
    }

    if (!cpf_cnpj) {
        inputErrors.push({ cpf_cnpj: "O campo 'cpf_cnpj' é obrigatório" });
    } else {
        if (account_type === "company") {
            var validCpfCnpj = validateCnpj(cpf_cnpj, "cpf_cnpj");
            if (validCpfCnpj != 'validCnpj') {
                inputErrors.push(validCpfCnpj);
            }
        }
    }

    if (!password) {
        inputErrors.push({ password: "O campo 'password' é obrigatório" });
    } else {
        var validPassword = validatePassword(password, 'password');
        if (validPassword != 'validPassword') {
            inputErrors.push(validPassword);
        }
    }

    if (!auth_code) {
        inputErrors.push({ auth_code: "O campo 'auth_code' é obrigatório" });
    } else {
        var validAuthCode = validateAuthCode(auth_code, 'auth_code', 4);
        if (validAuthCode != 'validAuthCode') {
            inputErrors.push(validAuthCode);
        }
    }

    if (inputErrors.length > 0) {
        res.status(422);
        res.json(errorResponse(422, inputErrors));
        return;
    }

    next();
}

export const checkLoginPreviousConditions = async (req, res, next) => {
    const account_type = req.body.account_type;
    const cpf_cnpj = req.body.cpf_cnpj;
    const password = req.body.password;
    const auth_code = req.body.auth_code;

    var userPassword = '';

    if (account_type === "company") {
        const checkCompanyAccountExistence = await selectIdNameEmailPasswordStatusByCnpj(cpf_cnpj);

        if (checkCompanyAccountExistence.dbError) {
            res.status(503);
            res.json(errorResponse(503, null, checkCompanyAccountExistence));
            return;
        } else if (!checkCompanyAccountExistence.rows[0] || (checkCompanyAccountExistence.rows[0].status !== 'ACTIVE_ACCOUNT' && checkCompanyAccountExistence.rows[0].status !== 'NEW_ACCOUNT')) {
            res.status(403);
            res.json(errorResponse(403, "CNPJ e/ou senha incorretos"));
            return;
        } else if (checkCompanyAccountExistence.rows[0].status === "NEW_ACCOUNT") {
            res.status(400);
            res.json(errorResponse(400, "A conta informada não está ativa"));
            return;
        }

        req.body.account_id = checkCompanyAccountExistence.rows[0].id;
        req.body.name = checkCompanyAccountExistence.rows[0].name;
        req.body.email = checkCompanyAccountExistence.rows[0].email;
        userPassword = checkCompanyAccountExistence.rows[0].password;
    }

    const passwordCompareResult = bcrypt.compareSync(password, userPassword);

    if (passwordCompareResult !== true) {
        res.status(403);
        res.json(errorResponse(403, "CNPJ e/ou senha incorretos"));
        return;
    }

    const checkAuthCode = await selectIdExpirationByCompanyAccount_id(req.body.account_id);

    if (checkAuthCode.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, checkAuthCode));
        return;
    }

    var actualTime = new Date()
    actualTime.setTime(actualTime.getTime());

    if (!checkAuthCode.rows[0] || actualTime > checkAuthCode.rows[0].expiration) {
        res.status(400);
        res.json(errorResponse(400, "Código de autenticação expirado ou inválido"));
        return;
    }

    var authCodeResult = await confirmAuthCode(req.body.account_id, account_type, "LOGIN", auth_code);

    if (authCodeResult.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, authCodeResult));
        return;
    }

    if (authCodeResult === false) {
        res.status(400);
        res.json(errorResponse(400, "Código de autenticação expirado ou inválido"));
        return;
    }

    next();
}