import { createAuthCode } from "../services/authCode.js";
import { hideEmail, sendMail } from "../services/email/email.js";
import { errorResponse } from "../services/responses/error.response.js";
import { successResponse } from "../services/responses/success.response.js";

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