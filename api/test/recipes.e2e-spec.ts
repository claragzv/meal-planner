import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Recipes (e2e)', () => {
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

        await prisma.recipe.deleteMany();
    });

    afterEach(async () => {
        await app.close();
    });

    describe('GET /recipes', () => {
        it('should return all recipes', async () => {
            const response = await request(app.getHttpServer())
                .get('/recipes')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return created recipes', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: 'Pasta con huevo y queso',
                prepTime: 25,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(201);

            const response = await request(app.getHttpServer())
                .get('/recipes')
                .expect(200);

            expect(response.body).toContainEqual({
                id: createResponse.body.id,
                ...recipe,
            });
        });

        it('should return an empty array when there are no recipes', async () => {
            const response = await request(app.getHttpServer())
                .get('/recipes')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });

    describe('POST /recipes', () => {
        it('should create a recipe', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: 'Pasta con huevo, queso y panceta',
                prepTime: 25,
            };

            const response = await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(201);

            expect(response.body).toEqual({
                id: expect.any(String),
                ...recipe,
            });
        });
    });

    describe('POST /recipes - validation', () => {
        it('should return the expected error response when name is empty', async () => {
            const response = await request(app.getHttpServer())
                .post('/recipes')
                .send({
                    name: '',
                    description: 'Pasta con huevo, queso y panceta',
                    prepTime: 25,
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
                .post('/recipes')
                .send({
                    description: 'Pasta con huevo, queso y panceta',
                    prepTime: 25,
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
                .post('/recipes')
                .send({
                    name: 123,
                    description: 'Pasta con huevo, queso y panceta',
                    prepTime: 25,
                })
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: ['name must be a string'],
            });
        });

        it('should return the expected error response when description is empty', async () => {
            const response = await request(app.getHttpServer())
                .post('/recipes')
                .send({
                    name: 'Pasta carbonara',
                    description: '',
                    prepTime: 25,
                })
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: ['description should not be empty'],
            });
        });

        it('should return 400 when description is missing', async () => {
            const response = await request(app.getHttpServer())
                .post('/recipes')
                .send({
                    name: 'Pasta carbonara',
                    prepTime: 25,
                })
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: [
                    'description should not be empty',
                    'description must be a string',
                ],
            });
        });

        it('should return 400 when description is not a string', async () => {
            const response = await request(app.getHttpServer())
                .post('/recipes')
                .send({
                    name: 'Pasta carbonara',
                    description: 123,
                    prepTime: 25,
                })
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: ['description must be a string'],
            });
        });

        it('should return 400 when prepTime is less than 1', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: 'Pasta con huevo, queso y panceta',
                prepTime: 0,
            };

            await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(400);
        });

        it('should return 400 when prepTime is not an integer', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: 'Pasta con huevo, queso y panceta',
                prepTime: 25.5,
            };

            await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(400);
        });

        it('should return 400 when prepTime is missing', async () => {
            const response = await request(app.getHttpServer())
                .post('/recipes')
                .send({
                    name: 'Pasta carbonara',
                    description: 'Pasta con huevo, queso y panceta',
                })
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: [
                    'prepTime must not be less than 1',
                    'prepTime must be an integer number',
                ],
            });
        });

        it('should return 400 when prepTime is not a number', async () => {
            const response = await request(app.getHttpServer())
                .post('/recipes')
                .send({
                    name: 'Pasta carbonara',
                    description: 'Pasta con huevo, queso y panceta',
                    prepTime: '25',
                })
                .expect(400);

            expect(response.body).toEqual({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: [
                    "prepTime must not be less than 1",
                    'prepTime must be an integer number'
                ],
            });
        });

        it('should return 400 when body contains an unknown property', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: 'Pasta con huevo, queso y panceta',
                prepTime: 25,
                pepino: true,
            };

            await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(400);
        });
    });

    describe('GET /recipes/:id', () => {
        it('should return a recipe by id', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: 'Pasta con huevo, queso y panceta',
                prepTime: 25,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(201);

            const id = createResponse.body.id;

            const response = await request(app.getHttpServer())
                .get(`/recipes/${id}`)
                .expect(200);

            expect(response.body).toEqual({
                id,
                ...recipe,
            });
        });
    });

    describe('GET /recipes/:id - errors', () => {
        it('should return 400 when id is not a valid UUID', async () => {
            await request(app.getHttpServer())
                .get('/recipes/not-a-uuid')
                .expect(400);
        });

        it('should return 404 with the expected error response when recipe does not exist', async () => {
            const response = await request(app.getHttpServer())
                .get(`/recipes/${nonExistingId}`)
                .expect(404);

            expect(response.body).toEqual({
                statusCode: 404,
                code: 'RECIPE_NOT_FOUND',
                message: expect.any(String),
            });
        });
    });

    describe('PATCH /recipes/:id', () => {
        it('should update a recipe', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: 'Pasta con huevo y queso',
                prepTime: 25,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(201);

            const id = createResponse.body.id;

            const update = {
                name: 'Pasta carbonara actualizada',
                prepTime: 30,
            };

            const response = await request(app.getHttpServer())
                .patch(`/recipes/${id}`)
                .send(update)
                .expect(200);

            expect(response.body).toEqual({
                id,
                name: 'Pasta carbonara actualizada',
                description: 'Pasta con huevo y queso',
                prepTime: 30,
            });
        });

        it('should allow an empty update', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: 'Pasta con huevo, queso y panceta',
                prepTime: 25,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(201);

            const id = createResponse.body.id;

            const response = await request(app.getHttpServer())
                .patch(`/recipes/${id}`)
                .send({})
                .expect(200);

            expect(response.body).toEqual({
                id,
                ...recipe,
            });
        });

        it('should return 400 when name is empty', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: 'Pasta con huevo, queso y panceta',
                prepTime: 25,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(201);

            const id = createResponse.body.id;

            await request(app.getHttpServer())
                .patch(`/recipes/${id}`)
                .send({
                    name: '',
                })
                .expect(400);
        });

        it('should return 400 when description is empty', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: 'Pasta con huevo, queso y panceta',
                prepTime: 25,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(201);

            const id = createResponse.body.id;

            await request(app.getHttpServer())
                .patch(`/recipes/${id}`)
                .send({
                    description: '',
                })
                .expect(400);
        });

        it('should return 400 when prepTime is less than 1', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: 'Pasta con huevo, queso y panceta',
                prepTime: 25,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(201);

            const id = createResponse.body.id;

            await request(app.getHttpServer())
                .patch(`/recipes/${id}`)
                .send({
                    prepTime: 0,
                })
                .expect(400);
        });

        it('should return 400 when prepTime is not an integer', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: 'Pasta con huevo, queso y panceta',
                prepTime: 25,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(201);

            const id = createResponse.body.id;

            await request(app.getHttpServer())
                .patch(`/recipes/${id}`)
                .send({
                    prepTime: 25.5,
                })
                .expect(400);
        });

        it('should return 400 when body contains an unknown property', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: 'Pasta con huevo, queso y panceta',
                prepTime: 25,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(201);

            const id = createResponse.body.id;

            await request(app.getHttpServer())
                .patch(`/recipes/${id}`)
                .send({
                    pepino: true,
                })
                .expect(400);
        });

        it('should return 400 when id is not a valid UUID', async () => {
            await request(app.getHttpServer())
                .patch('/recipes/not-a-uuid')
                .send({
                    name: 'Pasta actualizada',
                })
                .expect(400);
        });

        it('should return the expected error response when recipe does not exist', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/recipes/${nonExistingId}`)
                .send({
                    name: 'Pasta actualizada',
                })
                .expect(404);

            expect(response.body).toEqual({
                statusCode: 404,
                code: 'RECIPE_NOT_FOUND',
                message: expect.any(String),
            });
        });
    });

    describe('DELETE /recipes/:id', () => {
        it('should delete a recipe', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: 'Pasta con huevo y queso',
                prepTime: 25,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(201);

            const id = createResponse.body.id;

            await request(app.getHttpServer())
                .delete(`/recipes/${id}`)
                .expect(204);

            await request(app.getHttpServer())
                .get(`/recipes/${id}`)
                .expect(404);
        });

        it('should return 400 when id is not a valid UUID', async () => {
            await request(app.getHttpServer())
                .delete('/recipes/not-a-uuid')
                .expect(400);
        });

        it('should return the expected error response when recipe does not exist', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/recipes/${nonExistingId}`)
                .expect(404);

            expect(response.body).toEqual({
                statusCode: 404,
                code: 'RECIPE_NOT_FOUND',
                message: expect.any(String),
            });
        });
    });
});