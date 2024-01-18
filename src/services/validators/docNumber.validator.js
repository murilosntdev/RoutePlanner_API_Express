export const validateCnpj = (content, fieldName) => {
    const regex = /^[0-9]{14}$/;

    if (typeof content !== 'string') {
        return { [fieldName]: `O campo '${fieldName}' deve ser uma string numérica` };
    };
    if (content.trim() === "") {
        return { [fieldName]: `O campo '${fieldName}' é obrigatório` };
    };
    if (content.length != 14) {
        return { [fieldName]: `O campo '${fieldName}' deve conter 14 caracteres numéricos` };
    };
    if (!regex.exec(content)) {
        return { [fieldName]: `O campo '${fieldName}' contém caracteres inválidos` };
    };
    if (content == "00000000000000" || content == "11111111111111" || content == "22222222222222" || content == "33333333333333" || content == "44444444444444" || content == "55555555555555" || content == "66666666666666" || content == "77777777777777" || content == "88888888888888" || content == "99999999999999") {
        return { [fieldName]: `O campo '${fieldName}' deve conter um CNPJ válido` };
    };

    var cnpjLength = content.length - 2;
    var cnpjNumber = content.substring(0, cnpjLength);
    var verifDigit = content.substring(cnpjLength);
    var sum = 0;
    var pos = cnpjLength - 7;

    for (var i = cnpjLength; i >= 1; i--) {
        sum += cnpjNumber.charAt(cnpjLength - i) * pos--;

        if (pos < 2) {
            pos = 9;
        };
    };

    var result = sum % 11 < 2 ? 0 : 11 - sum % 11;

    if (result != verifDigit.charAt(0)) {
        return { [fieldName]: `O campo '${fieldName}' deve conter um CNPJ válido` };
    };

    cnpjLength = cnpjLength + 1;
    cnpjNumber = content.substring(0, cnpjLength);
    sum = 0;
    pos = cnpjLength - 7;

    for (var i = cnpjLength; i >= 1; i--) {
        sum += cnpjNumber.charAt(cnpjLength - i) * pos--;

        if (pos < 2) {
            pos = 9;
        };
    };

    result = sum % 11 < 2 ? 0 : 11 - sum % 11;

    if (result != verifDigit.charAt(1)) {
        return { [fieldName]: `O campo '${fieldName}' deve conter um CNPJ válido` };
    };

    return 'validCnpj';
};