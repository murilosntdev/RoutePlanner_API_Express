export const successResponse = (statusCode, details) => {
    const response = {};

    switch (statusCode) {
        case 200: {
            response.status = 200;
            response.message = "OK";
            break;
        }
        case 201: {
            response.status = 201;
            response.message = "Entidade Criada";
            break;
        };
        default: {
            response.status = 204;
            response.message = "Sem Conteúdo";
            break;
        };
    };

    if (details) {
        response.details = details;
    };

    return (response);
}