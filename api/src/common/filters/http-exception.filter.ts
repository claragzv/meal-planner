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

        if (this.isPrismaError(exception, 'P2003') || this.isPrismaError(exception, 'P2014')) {
            const meta = this.getPrismaMeta(exception);
            const field = typeof meta?.field_name === 'string' ? meta.field_name : undefined;
            return response.status(409).json({
                statusCode: 409,
                code: 'DEPENDENCY_CONFLICT',
                message: field
                    ? `The operation conflicts with a related record through ${field}.`
                    : 'The operation conflicts with a related record.',
                ...(field && { details: { field } }),
            });
        }

        if (this.isPrismaError(exception, 'P2025')) {
            const meta = this.getPrismaMeta(exception);
            return response.status(404).json({
                statusCode: 404,
                code: 'RELATED_RECORD_NOT_FOUND',
                message: 'A record required by this operation was not found.',
                ...(typeof meta?.cause === 'string' && { details: { cause: meta.cause } }),
            });
        }

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

    private isPrismaError(exception: unknown, code: string): boolean {
        return typeof exception === 'object' && exception !== null && 'code' in exception && exception.code === code;
    }

    private getPrismaMeta(exception: unknown): Record<string, unknown> | undefined {
        if (typeof exception !== 'object' || exception === null || !('meta' in exception)) return undefined;
        const meta = exception.meta;
        return typeof meta === 'object' && meta !== null ? meta as Record<string, unknown> : undefined;
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
