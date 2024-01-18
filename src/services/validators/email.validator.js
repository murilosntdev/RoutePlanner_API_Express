export const validateEmail = (content, fieldName) => {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (typeof content !== "string") {
        return { [fieldName]: `O campo '${fieldName}' deve ser uma string` };
    };
    if (content.trim() === "") {
        return { [fieldName]: `O campo '${fieldName}' é obrigatório` };
    };
    if (content.length < 5 || content.length > 100) {
        return { [fieldName]: `O campo '${fieldName}' deve conter entre 5 a 100 caracteres` };
    };
    if (!regex.exec(content)) {
        return { [fieldName]: `O campo '${fieldName}' deve conter um email válido` };
    };

    return 'validEmail';
};