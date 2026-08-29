import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (
                typeof exceptionResponse === 'object' &&
                exceptionResponse !== null &&
                'code' in exceptionResponse
            ) {
                return response.status(status).json(exceptionResponse);
            }

            const message =
                typeof exceptionResponse === 'string'
                    ? exceptionResponse
                    : 'message' in exceptionResponse
                        ? exceptionResponse.message
                        : 'HTTP error';

            return response.status(status).json({
                statusCode: status,
                code: this.getErrorCode(status),
                message,
            });
        }

        return response.status(500).json({
            statusCode: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error',
        });
    }

    private getErrorCode(status: number): string {
        switch (status) {
            case 400:
                /* 
                Este es para cuando es algo inválido pero solo una cosa, 
                no una posible lista de cosas. Para la lista se usa el ValidationErrorResponseDto, 
                que tiene un array de mensajes.
                ErrorResponseDto: uuid
                ValidationErrorResponseDto: name should not be empty, name must be a string, name must be at least 3 characters long...
                */
                return 'VALIDATION_ERROR';
            case 401:
                return 'UNAUTHORIZED';
            case 403:
                return 'FORBIDDEN';
            case 404:
                return 'NOT_FOUND';
            case 409:
                return 'CONFLICT';
            default:
                return 'HTTP_ERROR';
        }
    }
}