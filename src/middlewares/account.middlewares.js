import { selectIdStatusByCnpj, selectIdByCnpjEmail, selectIdExpirationByCompanyAccount_id } from "../models/Account.js";
import { errorResponse } from "../services/responses/error.response.js";
import { validateCnpj } from "../services/validators/docNumber.validator.js";
import { validateEmail } from "../services/validators/email.validator.js";
import { validateStringField } from "../services/validators/fieldFormat.validator.js";
import { validateCompanyName } from "../services/validators/name.validator.js";
import { validatePassword } from "../services/validators/password.validator.js";

export const validateNewCompanyInput = (req, res, next) => {
    const name = req.body.name;
    const cnpj = req.body.cnpj;
    const email = req.body.email;
    const password = req.body.password;

    var inputErrors = [];

    if (!name) {
        inputErrors.push({ name: "O campo 'name' é obrigatório" });
    } else {
        var validCompanyName = validateCompanyName(name, 'name');
        if (validCompanyName != 'validName') {
            inputErrors.push(validCompanyName);
        }
    }

    if (!cnpj) {
        inputErrors.push({ cnpj: "O campo 'cnpj' é obrigatório" });
    } else {
        var validCnpj = validateCnpj(cnpj, 'cnpj');
        if (validCnpj != 'validCnpj') {
            inputErrors.push(validCnpj);
        }
    }

    if (!email) {
        inputErrors.push({ email: "O campo 'email' é obrigatório" });
    } else {
        var validEmail = validateEmail(email, 'email');
        if (validEmail != 'validEmail') {
            inputErrors.push(validEmail);
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

export const checkNewCompanyPreviousConditions = async (req, res, next) => {
    const cnpj = req.body.cnpj;
    const email = req.body.email;

    const checkAccountExistence = await selectIdByCnpjEmail(cnpj, email);

    if (checkAccountExistence.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, checkAccountExistence));
        return;
    } else if (checkAccountExistence.rows[0]) {
        res.status(409);
        res.json(errorResponse(409, "Não é possível cadastrar uma companhia com esse CNPJ e/ou email"));
        return;
    }

    next();
}

export const validateActivateInput = (req, res, next) => {
    const action = req.body.action;
    const account_type = req.body.account_type;
    const cpf_cnpj = req.body.cpf_cnpj;

    var inputErrors = [];

    if (!action) {
        inputErrors.push({ action: "O campo 'action' é obrigatório" });
    } else {
        var validAction = validateStringField(action, 'action');
        if (validAction != 'validString') {
            inputErrors.push(validAction);
        }
    }

    if (!account_type) {
        inputErrors.push({ account_type: "O campo 'account_type' é obrigatório" });
    } else {
        var validAccountType = validateStringField(account_type, 'account_type');
        if (validAccountType != 'validString') {
            inputErrors.push(validAccountType);
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
        } else {
            inputErrors.push({ account_type: "O campo 'account_type' deve conter um valor válido" })
        }
    }

    if (inputErrors.length > 0) {
        res.status(422);
        res.json(errorResponse(422, inputErrors));
        return;
    }

    next();
}

export const checkActivatePreviousConditions = async (req, res, next) => {
    const action = req.body.action;
    const account_type = req.body.account_type;
    const cpf_cnpj = req.body.cpf_cnpj;

    if (account_type === "company") {
        const checkCompanyAccountExistence = await selectIdStatusByCnpj(cpf_cnpj);

        if (checkCompanyAccountExistence.dbError) {
            res.status(503);
            res.json(errorResponse(503, null, checkCompanyAccountExistence));
            return;
        } else if (!checkCompanyAccountExistence.rows[0]) {
            res.status(404);
            res.json(errorResponse(404, "Não existe uma companhia com o CNPJ informado"));
            return;
        } else if (checkCompanyAccountExistence.rows[0].status !== "NEW_ACCOUNT") {
            res.status(400);
            res.json(errorResponse(400, "Não pode ser gerado um código de autenticação para a conta informada"));
            return;
        }

        const checkAuthCode = await selectIdExpirationByCompanyAccount_id(checkCompanyAccountExistence.rows[0].id);

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

        req.body.account_id = checkCompanyAccountExistence.rows[0].id;
    }

    next();
}