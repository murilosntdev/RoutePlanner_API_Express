export const errorResponse = (statusCode, details, debugInfo) => {
    const response = {
        error: {}
    };

    switch (statusCode) {
        case 422: {
            response.error.status = 422;
            response.error.message = "Entidade Não Processável"
            break;
        };
        default: {
            response.error.status = 500;
            response.error.message = "Erro do Servidor Interno";
            break;
        };
    };

    if (details) response.error.details = details;
    if (process.env.SHOW_DEBUG_INFO && debugInfo) response.error.debugInfo = debugInfo;

    return (response);
};