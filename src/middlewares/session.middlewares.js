import { selectIdNameEmailPasswordStatusByCnpj, selectIdExpirationByCompanyAccount_id, selectIdAccountTypeCompanyIdExpirationByToken, selectCnpjStatusByAccountId, selectCnpjByAccountId } from "../models/Session.js";
import { confirmAuthCode } from "../services/authCode.js";
import { errorResponse } from "../services/responses/error.response.js";
import { validateAuthCode } from "../services/validators/authCode.validator.js";
import { validateCnpj } from "../services/validators/docNumber.validator.js";
import { validateStringField } from "../services/validators/fieldFormat.validator.js";
import { validatePassword } from "../services/validators/password.validator.js";
import * as bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

const { verify, decode } = jsonwebtoken;

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
            res.status(401);
            res.json(errorResponse(401, "CNPJ e/ou senha incorretos"));
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
        res.status(401);
        res.json(errorResponse(401, "CNPJ e/ou senha incorretos"));
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
            res.status(401);
            res.json(errorResponse(401, "CNPJ e/ou senha incorretos"));
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
        res.status(401);
        res.json(errorResponse(401, "CNPJ e/ou senha incorretos"));
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
        res.status(401);
        res.json(errorResponse(401, "Código de autenticação expirado ou inválido"));
        return;
    }

    var authCodeResult = await confirmAuthCode(req.body.account_id, account_type, "LOGIN", auth_code);

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

    next();
}

export const validateRefreshTokenInput = (req, res, next) => {
    const refresh_token = req.body.refresh_token;

    var inputErrors = [];

    if (!refresh_token) {
        inputErrors.push({ refresh_token: "O campo 'refresh_token' é obrigatório" });
    } else {
        var validRefreshToken = validateStringField(refresh_token, 'refresh_token');
        if (validRefreshToken != 'validString') {
            inputErrors.push(validRefreshToken);
        }
    }

    if (inputErrors.length > 0) {
        res.status(422);
        res.json(errorResponse(422, inputErrors));
        return;
    }

    next();
}

export const checkRefreshTokenPreviousConditions = async (req, res, next) => {
    const refresh_token = req.body.refresh_token;

    try {
        verify(refresh_token, process.env.JWT_REFRESH_TOKEN_KEY);
    } catch (error) {
        res.status(401);
        res.json(errorResponse(401, "'refresh_token' expirado ou inválido"));
        return;
    }

    const decodedRefreshToken = decode(refresh_token, process.env.JWT_REFRESH_TOKEN_KEY);

    const dbRefreshTokenInfos = await selectIdAccountTypeCompanyIdExpirationByToken(refresh_token);

    if (dbRefreshTokenInfos.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, dbRefreshTokenInfos));
        return;
    } else if (!dbRefreshTokenInfos.rows[0]) {
        res.status(401);
        res.json(errorResponse(401, "'refresh_token' expirado ou inválido"));
        return;
    }

    var expirationTimestamp = new Date(dbRefreshTokenInfos.rows[0].expiration);

    if (
        (decodedRefreshToken.account_type != dbRefreshTokenInfos.rows[0].account_type) ||
        (decodedRefreshToken.account_id != dbRefreshTokenInfos.rows[0].company_id) ||
        (decodedRefreshToken.exp != Math.floor(expirationTimestamp.getTime() / 1000))
    ) {
        res.status(401);
        res.json(errorResponse(401, "'refresh_token' expirado ou inválido"));
        return;
    }

    const accountData = await selectCnpjStatusByAccountId(decodedRefreshToken.account_id);

    if (dbRefreshTokenInfos.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, dbRefreshTokenInfos));
        return;
    } else if (accountData.rows[0].status != "ACTIVE_ACCOUNT") {
        res.status(401);
        res.json(errorResponse(401, "'refresh_token' expirado ou inválido"));
        return;
    }

    req.body.account_type = dbRefreshTokenInfos.rows[0].account_type;
    req.body.account_id = decodedRefreshToken.account_id;
    req.body.cpf_cnpj = accountData.rows[0].cnpj;
    req.body.refreshTokenId = dbRefreshTokenInfos.rows[0].id;

    next();
}

export const validateLogoutInput = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        res.status(401);
        res.json(errorResponse(401, { authorization: "O header 'Authorization' é obrigatório" }));
        return;
    }

    const bearer_token = authorization.substring(7);

    try {
        verify(bearer_token, process.env.JWT_BEARER_TOKEN_KEY);
    } catch (error) {
        res.status(401);
        res.json(errorResponse(401, "'refresh_token' expirado ou inválido"));
        return;
    }

    req.body.bearer_token = bearer_token;

    next();
}

export const authLogout = async (req, res, next) => {
    const bearer_token = req.body.bearer_token;

    const decodedBearerToken = decode(bearer_token, process.env.JWT_BEARER_TOKEN_KEY);
    const accountInfo = await selectCnpjByAccountId(decodedBearerToken.account_id);

    if (accountInfo.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, accountInfo));
        return;
    };

    const accountInfoCompareResult = bcrypt.compareSync(accountInfo.rows[0].cnpj, decodedBearerToken.account_info);

    if (accountInfoCompareResult != true) {
        res.status(403);
        res.json(errorResponse(403, "Você não possui permissão para realizar a ação"));
        return;
    }

    req.body.account_type = decodedBearerToken.account_type;
    req.body.account_id = decodedBearerToken.account_id;

    next();
}