import {
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { AppException } from '../exceptions/app.exception.js';
import { jest } from '@jest/globals';

describe('HttpExceptionFilter', () => {
    let filter: HttpExceptionFilter;

    const responseMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    const hostMock = {
        switchToHttp: jest.fn().mockReturnValue({
            getResponse: jest.fn().mockReturnValue(responseMock),
        }),
    } as unknown as ArgumentsHost;

    beforeEach(() => {
        jest.clearAllMocks();
        filter = new HttpExceptionFilter();
    });

    it('should be defined', () => {
        expect(filter).toBeDefined();
    });

    it('should return the exception response with its status code', () => {
        const exception = new HttpException(
            {
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: 'Invalid request',
            },
            HttpStatus.BAD_REQUEST,
        );

        // Simulamos que Nest le entrega una excepción al filtro
        filter.catch(exception, hostMock);

        // Comprobamos que el filtro pone el HTTP status correcto
        expect(responseMock.status).toHaveBeenCalledWith(400);

        // Comprobamos que no modifica ni pierde el cuerpo de nuestra excepción
        expect(responseMock.json).toHaveBeenCalledWith({
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Invalid request',
        });
    });

    it('should return an AppException response', () => {
        const exception = new AppException(
            HttpStatus.NOT_FOUND,
            'RECIPE_NOT_FOUND',
            'Recipe not found',
        );

        filter.catch(exception, hostMock);

        expect(responseMock.status).toHaveBeenCalledWith(404);

        expect(responseMock.json).toHaveBeenCalledWith({
            statusCode: 404,
            code: 'RECIPE_NOT_FOUND',
            message: 'Recipe not found',
        });
    });

    it('should return 500 for an unexpected error', () => {
        const exception = new Error('Something went wrong');

        filter.catch(exception, hostMock);

        expect(responseMock.status).toHaveBeenCalledWith(500);

        expect(responseMock.json).toHaveBeenCalledWith({
            statusCode: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error',
        });
    });
});