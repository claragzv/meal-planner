import { NotFoundException } from '@nestjs/common';

export class ProductNotFoundException extends NotFoundException {
    constructor(id: string) {
        super({
            statusCode: 404,
            code: 'PRODUCT_NOT_FOUND',
            message: `Product with id ${id} not found`,
        });
    }
}
