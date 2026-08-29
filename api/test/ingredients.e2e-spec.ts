import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Ingredients (e2e)', () => {
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

        await prisma.ingredient.deleteMany();
    });

    afterEach(async () => {
        await app.close();
    });

    describe('GET /ingredients', () => {
        it('should return all ingredients', async () => {
            const response = await request(app.getHttpServer())
                .get('/ingredients')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return created ingredients', async () => {
            const ingredient = {
                name: 'Pasta',
                defaultUnit: 'g',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/ingredients')
                .send(ingredient)
                .expect(201);

            const response = await request(app.getHttpServer())
                .get('/ingredients')
                .expect(200);

            expect(response.body).toContainEqual({
                id: createResponse.body.id,
                ...ingredient,
            });
        });

        it('should return an empty array when there are no ingredients', async () => {
            const response = await request(app.getHttpServer())
                .get('/ingredients')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });

    describe('POST /ingredients', () => {
        it('should create an ingredient', async () => {
            const ingredient = {
                name: 'Pasta',
                defaultUnit: 'g',
            };

            const response = await request(app.getHttpServer())
                .post('/ingredients')
                .send(ingredient)
                .expect(201);

            expect(response.body).toEqual({
                id: expect.any(String),
                ...ingredient,
            });
        });
    });

    describe('POST /ingredients - validation', () => {
        it('should return the expected error response when name is empty', async () => {
            const response = await request(app.getHttpServer())
                .post('/ingredients')
                .send({
                    name: '',
                    defaultUnit: 'g',
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
                .post('/ingredients')
                .send({
                    defaultUnit: 'g',
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
                .post('/ingredients')
                .send({
                    name: 123,
                    defaultUnit: 'g',
                })
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: ['name must be a string'],
            });
        });

        it('should return the expected error response when defaultUnit is empty', async () => {
            const response = await request(app.getHttpServer())
                .post('/ingredients')
                .send({
                    name: 'Pasta',
                    defaultUnit: '',
                })
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: ['defaultUnit should not be empty'],
            });
        });

        it('should return 400 when defaultUnit is missing', async () => {
            const response = await request(app.getHttpServer())
                .post('/ingredients')
                .send({
                    name: 'Pasta',
                })
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: [
                    'defaultUnit should not be empty',
                    'defaultUnit must be a string',
                ],
            });
        });

        it('should return 400 when defaultUnit is not a string', async () => {
            const response = await request(app.getHttpServer())
                .post('/ingredients')
                .send({
                    name: 'Pasta',
                    defaultUnit: 123,
                })
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: ['defaultUnit must be a string'],
            });
        });

        it('should return 400 when body contains an unknown property', async () => {
            await request(app.getHttpServer())
                .post('/ingredients')
                .send({
                    name: 'Pasta',
                    defaultUnit: 'g',
                    pepino: true,
                })
                .expect(400);
        });
    });

    describe('GET /ingredients/:id', () => {
        it('should return an ingredient by id', async () => {
            const ingredient = {
                name: 'Pasta',
                defaultUnit: 'g',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/ingredients')
                .send(ingredient)
                .expect(201);

            const id = createResponse.body.id;

            const response = await request(app.getHttpServer())
                .get(`/ingredients/${id} `)
                .expect(200);

            expect(response.body).toEqual({
                id,
                ...ingredient,
            });
        });
    });

    describe('GET /ingredients/:id - errors', () => {
        it('should return 400 when id is not a valid UUID', async () => {
            const response = await request(app.getHttpServer())
                .get('/ingredients/not-a-uuid')
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: expect.any(String),
            });
        });

        it('should return 404 with the expected error response when ingredient does not exist', async () => {
            const response = await request(app.getHttpServer())
                .get(`/ingredients/${nonExistingId} `)
                .expect(404);

            expect(response.body).toEqual({
                statusCode: 404,
                code: 'INGREDIENT_NOT_FOUND',
                message: expect.any(String),
            });
        });
    });

    describe('PATCH /ingredients/:id', () => {
        it('should update an ingredient', async () => {
            const ingredient = {
                name: 'Pasta',
                defaultUnit: 'g',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/ingredients')
                .send(ingredient)
                .expect(201);

            const id = createResponse.body.id;

            const update = {
                name: 'Harina',
                defaultUnit: 'kg',
            };

            const response = await request(app.getHttpServer())
                .patch(`/ingredients/${id} `)
                .send(update)
                .expect(200);

            expect(response.body).toEqual({
                id,
                ...update,
            });
        });

        it('should allow an empty update', async () => {
            const ingredient = {
                name: 'Pasta',
                defaultUnit: 'g',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/ingredients')
                .send(ingredient)
                .expect(201);

            const id = createResponse.body.id;

            const response = await request(app.getHttpServer())
                .patch(`/ingredients/${id} `)
                .send({})
                .expect(200);

            expect(response.body).toEqual({
                id,
                ...ingredient,
            });
        });

        it('should return 400 when name is empty', async () => {
            const ingredient = {
                name: 'Pasta',
                defaultUnit: 'g',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/ingredients')
                .send(ingredient)
                .expect(201);

            const id = createResponse.body.id;

            await request(app.getHttpServer())
                .patch(`/ingredients/${id} `)
                .send({
                    name: '',
                })
                .expect(400);
        });

        it('should return 400 when name is not a string', async () => {
            const ingredient = {
                name: 'Pasta',
                defaultUnit: 'g',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/ingredients')
                .send(ingredient)
                .expect(201);

            const id = createResponse.body.id;

            await request(app.getHttpServer())
                .patch(`/ingredients/${id} `)
                .send({
                    name: 123,
                })
                .expect(400);
        });

        it('should return 400 when defaultUnit is empty', async () => {
            const ingredient = {
                name: 'Pasta',
                defaultUnit: 'g',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/ingredients')
                .send(ingredient)
                .expect(201);

            const id = createResponse.body.id;

            await request(app.getHttpServer())
                .patch(`/ingredients/${id} `)
                .send({
                    defaultUnit: '',
                })
                .expect(400);
        });

        it('should return 400 when defaultUnit is not a string', async () => {
            const ingredient = {
                name: 'Pasta',
                defaultUnit: 'g',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/ingredients')
                .send(ingredient)
                .expect(201);

            const id = createResponse.body.id;

            await request(app.getHttpServer())
                .patch(`/ingredients/${id} `)
                .send({
                    defaultUnit: 123,
                })
                .expect(400);
        });

        it('should return 400 when body contains an unknown property', async () => {
            const ingredient = {
                name: 'Pasta',
                defaultUnit: 'g',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/ingredients')
                .send(ingredient)
                .expect(201);

            const id = createResponse.body.id;

            await request(app.getHttpServer())
                .patch(`/ingredients/${id} `)
                .send({
                    pepino: true,
                })
                .expect(400);
        });

        it('should return 400 when id is not a valid UUID', async () => {
            await request(app.getHttpServer())
                .patch('/ingredients/not-a-uuid')
                .send({
                    name: 'Harina',
                })
                .expect(400);
        });

        it('should return the expected error response when ingredient does not exist', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/ingredients/${nonExistingId} `)
                .send({
                    name: 'Harina',
                })
                .expect(404);

            expect(response.body).toEqual({
                statusCode: 404,
                code: 'INGREDIENT_NOT_FOUND',
                message: expect.any(String),
            });
        });
    });

    describe('DELETE /ingredients/:id', () => {
        it('should delete an ingredient', async () => {
            const ingredient = {
                name: 'Pasta',
                defaultUnit: 'g',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/ingredients')
                .send(ingredient)
                .expect(201);

            const id = createResponse.body.id;

            await request(app.getHttpServer())
                .delete(`/ingredients/${id} `)
                .expect(204);

            await request(app.getHttpServer())
                .get(`/ingredients/${id} `)
                .expect(404);
        });

        it('should return 400 when id is not a valid UUID', async () => {
            await request(app.getHttpServer())
                .delete('/ingredients/not-a-uuid')
                .expect(400);
        });

        it('should return the expected error response when ingredient does not exist', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/ingredients/${nonExistingId} `)
                .expect(404);

            expect(response.body).toEqual({
                statusCode: 404,
                code: 'INGREDIENT_NOT_FOUND',
                message: expect.any(String),
            });
        });
    });

    describe('GET /ingredients/:id/products', () => {
        it('should return products for an ingredient', async () => {
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

            const createResponse = await request(app.getHttpServer())
                .post('/products')
                .send(product)
                .expect(201);

            const response = await request(app.getHttpServer())
                .get(`/ingredients/${ingredient.id}/products`)
                .expect(200);

            expect(response.body).toEqual([
                {
                    id: createResponse.body.id,
                    ...product,
                },
            ]);
        });

        it('should return an empty array when the ingredient has no products', async () => {
            const ingredient = await prisma.ingredient.create({
                data: {
                    name: 'Leche',
                    defaultUnit: 'l',
                },
            });

            const response = await request(app.getHttpServer())
                .get(`/ingredients/${ingredient.id}/products`)
                .expect(200);

            expect(response.body).toEqual([]);
        });

        it('should return 400 when ingredient id is not a valid UUID', async () => {
            await request(app.getHttpServer())
                .get('/ingredients/not-a-uuid/products')
                .expect(400);
        });

        it('should return 404 when ingredient does not exist', async () => {
            const nonExistingId =
                '550e8400-e29b-41d4-a716-446655440099';

            const response = await request(app.getHttpServer())
                .get(`/ingredients/${nonExistingId}/products`)
                .expect(404);

            expect(response.body).toEqual({
                statusCode: 404,
                code: 'INGREDIENT_NOT_FOUND',
                message: expect.any(String),
            });
        });
    });

});

