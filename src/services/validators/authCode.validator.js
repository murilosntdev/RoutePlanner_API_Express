export const validateAuthCode = (content, fieldName, length) => {
    if (typeof content !== "string") {
        return { [fieldName]: `O campo '${fieldName}' deve ser uma string` };
    };
    if (content.trim() === "") {
        return { [fieldName]: `O campo '${fieldName}' é obrigatório` };
    };
    if (content.length != length) {
        return { [fieldName]: `O campo '${fieldName}' deve conter ${length} caracteres` };
    };

    return 'validAuthCode';
}