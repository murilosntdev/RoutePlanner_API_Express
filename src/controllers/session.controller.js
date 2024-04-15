import { createRefreshToken, revokeRefreshToken, updateLastAccessByCnpj } from "../models/Session.js";
import { createAuthCode } from "../services/authCode.js";
import { hideEmail, sendMail } from "../services/email/email.js";
import { errorResponse } from "../services/responses/error.response.js";
import { successResponse } from "../services/responses/success.response.js";
import jsonwebtoken from "jsonwebtoken";
import * as bcrypt from "bcrypt";

const { sign } = jsonwebtoken;

export const preLogin = async (req, res) => {
    const account_type = req.body.account_type;
    const cpf_cnpj = req.body.cpf_cnpj;
    const account_id = req.body.account_id;
    const name = req.body.name;
    const email = req.body.email;

    var authCodeResult = await createAuthCode(account_id, account_type, "LOGIN", 4, 3);
    if (authCodeResult.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, authCodeResult));
        return;
    }

    var templateContext = {
        name: name,
        authCode: authCodeResult.rows[0].hash
    };

    var emailResult = await sendMail(email, 'Acesse sua Conta', 'login', templateContext);

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
}

export const login = async (req, res) => {
    const account_type = req.body.account_type;
    const cpf_cnpj = req.body.cpf_cnpj;
    const account_id = req.body.account_id;
    const name = req.body.name;
    const email = req.body.email;

    const lastAccess = await updateLastAccessByCnpj(cpf_cnpj);

    if (lastAccess.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, lastAccess));
        return;
    }

    const revokeResult = await revokeRefreshToken(account_id, account_type);

    if (revokeResult.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, revokeResult));
        return;
    }

    const jwtRefreshToken = sign({
        account_type,
        account_id,
    },
        process.env.JWT_REFRESH_TOKEN_KEY,
        {
            expiresIn: "12h"
        }
    );

    const refreshToken = await createRefreshToken(account_id, account_type, jwtRefreshToken);

    if (refreshToken.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, refreshToken));
        return;
    }

    const hashCpf_cnpj = bcrypt.hashSync(cpf_cnpj, 10);

    const jwtBearerToken = sign({
        account_type,
        account_id,
        account_info: hashCpf_cnpj
    },
        process.env.JWT_BEARER_TOKEN_KEY,
        {
            expiresIn: "1h"
        }
    );

    const responseDetail = {
        "result": "Acesso Garantido",
        "bearer_token": jwtBearerToken,
        "refresh_token": refreshToken.rows[0].token,
        "account_info": {
            "type": account_type,
            "id": account_id,
            name,
            cpf_cnpj,
            email
        }
    };

    res.status(200);
    res.json(successResponse(200, responseDetail));
}

export const refreshToken = async (req, res) => {
    const account_type = req.body.account_type;
    const account_id = req.body.account_id;
    const cpf_cnpj = req.body.cpf_cnpj;

    const revokeResult = await revokeRefreshToken(account_id, account_type);

    if (revokeResult.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, revokeResult));
        return;
    }

    const jwtRefreshToken = sign({
        account_type,
        account_id,
    },
        process.env.JWT_REFRESH_TOKEN_KEY,
        {
            expiresIn: "12h"
        }
    );

    const refreshToken = await createRefreshToken(account_id, account_type, jwtRefreshToken);

    if (refreshToken.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, refreshToken));
        return;
    }

    const hashCpf_cnpj = bcrypt.hashSync(cpf_cnpj, 10);

    const jwtBearerToken = sign({
        account_type,
        account_id,
        account_info: hashCpf_cnpj
    },
        process.env.JWT_BEARER_TOKEN_KEY,
        {
            expiresIn: "1h"
        }
    );

    const responseDetail = {
        "bearer_token": jwtBearerToken,
        "refresh_token": refreshToken.rows[0].token
    };

    res.status(200);
    res.json(successResponse(200, responseDetail));
}

export const logout = async (req, res) => {
    const account_type = req.body.account_type;
    const account_id = req.body.account_id;

    const revokeResult = await revokeRefreshToken(account_id, account_type);

    if (revokeResult.dbError) {
        res.status(503);
        res.json(errorResponse(503, null, revokeResult));
        return;
    }

    res.status(204);
    res.json(successResponse(204));
}