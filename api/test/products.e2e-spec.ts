import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Products (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    const nonExistingId =
        '550e8400-e29b-41d4-a716-446655440099';

    beforeEach(async () => {
        const moduleFixture: TestingModule =
            await Test.createTestingModule({
                imports: [AppModule],
            }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        app.useGlobalFilters(new HttpExceptionFilter());

        await app.init();

        prisma = app.get(PrismaService);

        await prisma.product.deleteMany();

    });

    afterEach(async () => {
        await app.close();
    });

    describe('GET /products', () => {
        it('should return all products', async () => {
            const response = await request(app.getHttpServer())
                .get('/products')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return created products', async () => {
            const product = {
                name: 'Leche Entera',
                brand: 'Hacendado',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/products')
                .send(product)
                .expect(201);

            const response = await request(app.getHttpServer())
                .get('/products')
                .expect(200);

            expect(response.body).toContainEqual({
                id: createResponse.body.id,
                ...product,
                ingredientId: null,
            });
        });

        it('should return an empty array when there are no products', async () => {
            const response = await request(app.getHttpServer())
                .get('/products')
                .expect(200);

            expect(response.body).toEqual([]);
        });


    });

    describe('POST /products', () => {
        it('should create a product', async () => {
            const product = {
                name: 'Leche Entera',
                brand: 'Hacendado',
            };


            const response = await request(app.getHttpServer())
                .post('/products')
                .send(product)
                .expect(201);

            expect(response.body).toEqual({
                id: expect.any(String),
                name: 'Leche Entera',
                brand: 'Hacendado',
                ingredientId: null,
            });
        });

        it('should create a product with an ingredientId', async () => {
            const ingredient = await prisma.ingredient.create({
                data: {
                    name: 'Leche',
                    defaultUnit: 'l',
                },
            });

            const product = {
                name: 'Leche Entera',
                brand: 'Hacendado',
                ingredientId: ingredient.id,
            };

            const response = await request(app.getHttpServer())
                .post('/products')
                .send(product)
                .expect(201);

            expect(response.body).toEqual({
                id: expect.any(String),
                ...product,
            });
        });


    });

    describe('POST /products - validation', () => {
        it('should return 400 when name is empty', async () => {
            const response = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: '',
                    brand: 'Hacendado',
                })
                .expect(400);


            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: ['name should not be empty'],
            });
        });

        it('should return 400 when name is missing', async () => {
            const response = await request(app.getHttpServer())
                .post('/products')
                .send({
                    brand: 'Hacendado',
                })
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: [
                    'name should not be empty',
                    'name must be a string',
                ],
            });
        });

        it('should return 400 when name is not a string', async () => {
            const response = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 123,
                    brand: 'Hacendado',
                })
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: ['name must be a string'],
            });
        });

        it('should allow brand to be omitted', async () => {
            const response = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Leche Entera',
                })
                .expect(201);

            expect(response.body).toEqual({
                id: expect.any(String),
                name: 'Leche Entera',
                brand: null,
                ingredientId: null,
            });
        });

        it('should return 400 when brand is not a string', async () => {
            const response = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Leche Entera',
                    brand: 123,
                })
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: ['brand must be a string'],
            });
        });

        it('should return 400 when ingredientId is not a valid UUID', async () => {
            await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Leche Entera',
                    brand: 'Hacendado',
                    ingredientId: 'not-a-uuid',
                })
                .expect(400);
        });

        it('should return 400 when body contains an unknown property', async () => {
            await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Leche Entera',
                    brand: 'Hacendado',
                    pepino: true,
                })
                .expect(400);
        });


    });

    describe('GET /products/:id', () => {
        it('should return a product by id', async () => {
            const product = {
                name: 'Leche Entera',
                brand: 'Hacendado',
            };


            const createResponse = await request(app.getHttpServer())
                .post('/products')
                .send(product)
                .expect(201);

            const id = createResponse.body.id;

            const response = await request(app.getHttpServer())
                .get(`/products/${id}`)
                .expect(200);

            expect(response.body).toEqual({
                id,
                ...product,
                ingredientId: null,
            });
        });


    });

    describe('GET /products/:id - errors', () => {
        it('should return 400 when id is not a valid UUID', async () => {
            await request(app.getHttpServer())
                .get('/products/not-a-uuid')
                .expect(400);
        });


        it('should return 404 with the expected error response when product does not exist', async () => {
            const response = await request(app.getHttpServer())
                .get(`/products/${nonExistingId}`)
                .expect(404);

            expect(response.body).toEqual({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: expect.any(String),
            });
        });


    });

    describe('PATCH /products/:id', () => {
        it('should update a product', async () => {
            const product = {
                name: 'Leche Entera',
                brand: 'Hacendado',
            };


            const createResponse = await request(app.getHttpServer())
                .post('/products')
                .send(product)
                .expect(201);

            const id = createResponse.body.id;

            const update = {
                name: 'Leche Entera Mejorada',
                brand: 'Hacendado',
            };

            const response = await request(app.getHttpServer())
                .patch(`/products/${id}`)
                .send(update)
                .expect(200);

            expect(response.body).toEqual({
                id,
                name: 'Leche Entera Mejorada',
                brand: 'Hacendado',
                ingredientId: null,
            });
        });

        it('should allow an empty update', async () => {
            const product = {
                name: 'Leche Entera',
                brand: 'Hacendado',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/products')
                .send(product)
                .expect(201);

            const id = createResponse.body.id;

            const response = await request(app.getHttpServer())
                .patch(`/products/${id}`)
                .send({})
                .expect(200);

            expect(response.body).toEqual({
                id,
                ...product,
                ingredientId: null,
            });
        });

        it('should allow updating ingredientId', async () => {
            const ingredient = await prisma.ingredient.create({
                data: {
                    name: 'Leche',
                    defaultUnit: 'l',
                },
            });

            const product = {
                name: 'Leche Entera',
                brand: 'Hacendado',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/products')
                .send(product)
                .expect(201);

            const id = createResponse.body.id;

            const response = await request(app.getHttpServer())
                .patch(`/products/${id}`)
                .send({
                    ingredientId: ingredient.id,
                })
                .expect(200);

            expect(response.body).toEqual({
                id,
                name: 'Leche Entera',
                brand: 'Hacendado',
                ingredientId: ingredient.id,
            });
        });

        it('should return 400 when name is empty', async () => {
            const createResponse = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Leche Entera',
                })
                .expect(201);

            await request(app.getHttpServer())
                .patch(`/products/${createResponse.body.id}`)
                .send({
                    name: '',
                })
                .expect(400);
        });

        it('should return 400 when brand is not a string', async () => {
            const createResponse = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Leche Entera',
                })
                .expect(201);

            await request(app.getHttpServer())
                .patch(`/products/${createResponse.body.id}`)
                .send({
                    brand: 123,
                })
                .expect(400);
        });

        it('should return 400 when ingredientId is not a valid UUID', async () => {
            const createResponse = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Leche Entera',
                })
                .expect(201);

            await request(app.getHttpServer())
                .patch(`/products/${createResponse.body.id}`)
                .send({
                    ingredientId: 'not-a-uuid',
                })
                .expect(400);
        });

        it('should return 400 when body contains an unknown property', async () => {
            const createResponse = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Leche Entera',
                })
                .expect(201);

            await request(app.getHttpServer())
                .patch(`/products/${createResponse.body.id}`)
                .send({
                    pepino: true,
                })
                .expect(400);
        });

        it('should return 400 when id is not a valid UUID', async () => {
            await request(app.getHttpServer())
                .patch('/products/not-a-uuid')
                .send({
                    name: 'Leche actualizada',
                })
                .expect(400);
        });

        it('should return the expected error response when product does not exist', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/products/${nonExistingId}`)
                .send({
                    name: 'Leche actualizada',
                })
                .expect(404);

            expect(response.body).toEqual({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: expect.any(String),
            });
        });


    });

    describe('DELETE /products/:id', () => {
        it('should delete a product', async () => {
            const product = {
                name: 'Leche Entera',
                brand: 'Hacendado',
            };


            const createResponse = await request(app.getHttpServer())
                .post('/products')
                .send(product)
                .expect(201);

            const id = createResponse.body.id;

            await request(app.getHttpServer())
                .delete(`/products/${id}`)
                .expect(204);

            await request(app.getHttpServer())
                .get(`/products/${id}`)
                .expect(404);
        });

        it('should return 400 when id is not a valid UUID', async () => {
            await request(app.getHttpServer())
                .delete('/products/not-a-uuid')
                .expect(400);
        });

        it('should return the expected error response when product does not exist', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/products/${nonExistingId}`)
                .expect(404);

            expect(response.body).toEqual({
                statusCode: 404,
                code: 'PRODUCT_NOT_FOUND',
                message: expect.any(String),
            });
        });


    });
});
