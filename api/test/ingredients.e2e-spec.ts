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
});
