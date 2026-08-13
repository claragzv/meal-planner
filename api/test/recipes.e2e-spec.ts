import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Recipes (e2e)', () => {
    let app: INestApplication;
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

        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    describe('GET /recipes', () => {
        it('should return all recipes', async () => {
            await request(app.getHttpServer())
                .get('/recipes')
                .expect(200);
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

            expect(response.body).toMatchObject(recipe);
            expect(response.body.id).toBeDefined();
        });
    });

    describe('POST /recipes - validation', () => {
        it('should return 400 when name is empty', async () => {
            const recipe = {
                name: '',
                description: 'Pasta con huevo, queso y panceta',
                prepTime: 25,
            };

            await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(400);
        });

        it('should return 400 when description is empty', async () => {
            const recipe = {
                name: 'Pasta carbonara',
                description: '',
                prepTime: 25,
            };

            await request(app.getHttpServer())
                .post('/recipes')
                .send(recipe)
                .expect(400);
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

            expect(response.body).toMatchObject(recipe);
            expect(response.body.id).toBe(id);
        });
    });

    describe('GET /recipes/:id - errors', () => {
        it('should return 400 when id is not a valid UUID', async () => {
            await request(app.getHttpServer())
                .get('/recipes/not-a-uuid')
                .expect(400);
        });

        it('should return 404 when recipe does not exist', async () => {
            await request(app.getHttpServer())
                .get(`/recipes/${nonExistingId}`)
                .expect(404);
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

            expect(response.body).toMatchObject({
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

            expect(response.body).toMatchObject({
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

        it('should return 404 when recipe does not exist', async () => {
            await request(app.getHttpServer())
                .patch(`/recipes/${nonExistingId}`)
                .send({
                    name: 'Pasta actualizada',
                })
                .expect(404);
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
        });

        it('should return 400 when id is not a valid UUID', async () => {
            await request(app.getHttpServer())
                .delete('/recipes/not-a-uuid')
                .expect(400);
        });

        it('should return 404 when recipe does not exist', async () => {
            await request(app.getHttpServer())
                .delete(`/recipes/${nonExistingId}`)
                .expect(404);
        });
    });
});