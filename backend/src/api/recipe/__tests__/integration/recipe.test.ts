import prisma from '../../../../client'
import { agent as request } from "supertest";
import server from "../../../../server";
import { StatusCodes } from "http-status-codes";
import { seedDatabaseWithData, clearDatabase } from '../../../../jest/helpers';

const agent = request(server);

beforeAll(async () => {
    await seedDatabaseWithData()
})

afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect()
    server.close()
})

describe('get all recipes', () => {
    describe('should return bad request on invalid arguments', () => {
        it.each<string | jest.DoneCallback>([
            'test',
            '3',
            '$',
            'null',
            'undefined',
            ''
        ])('query param bonus: %s', (param, done: jest.DoneCallback) => {
            agent
                .get('/recipes/')
                .query({ bonus: param })
                .expect(StatusCodes.BAD_REQUEST, {
                    errors: [
                        {
                            value: param,
                            msg: 'bonus should be a Boolean value',
                            param: 'bonus',
                            location: 'query'
                        }
                    ]
                }, done)
        })
    })

    it('should return ok status and all recipes with no query params', async () => {
        const response = await agent
            .get('/recipes/')
            .expect(StatusCodes.OK)

        expect(response.body.length).toBe(3)
    })

    it('should return ok status and all bonus recipes with bonus query param set to true', async () => {
        const response = await agent
            .get('/recipes/')
            .query({ bonus: 'true' })
            .expect(StatusCodes.OK)

        expect(response.body.length).toBe(2)
    })

    it('should return ok status and all non-bonus recipes with bonus query param set to false', async () => {
        const response = await agent
            .get('/recipes/')
            .query({ bonus: 'false' })
            .expect(StatusCodes.OK)

        expect(response.body.length).toBe(1)
    })
})

describe('get a recipe by ID', () => {
    it('should return ok status and the recipe with the corresponding ID', async () => {
        const recipe = await prisma.recipe.findFirst();

        const response = await agent
            .get(`/recipes/${recipe?.id}`)
            .expect(StatusCodes.OK)

        expect(response.body.id).toBe(recipe?.id)
        expect(response.body.name).toBe(recipe?.name)
        expect(response.body.description).toBe(recipe?.description)
        expect(response.body.rating).toBe(recipe?.rating)
    })

    it('should return not found status if no recipe with the ID exists', async () => {
        const recipeIds = (await prisma.recipe.findMany()).map(recipe => recipe.id);

        let nonExistentId = 0;

        while (recipeIds.includes(nonExistentId)) {
            nonExistentId += 1;
        }

        await agent
            .get(`/recipes/${nonExistentId}`)
            .expect(StatusCodes.NOT_FOUND, {
                errors: [{ msg: `No recipe with ID ${nonExistentId} exists in the database` }]
            })
    })
})

describe('create a recipe', () => {
    describe('should return bad request on invalid arguments', () => {
        it.each<any | jest.DoneCallback>([
            { name: undefined, description: undefined, rating: undefined },
            { name: '', description: undefined, rating: undefined },
            { name: 3, description: undefined, rating: undefined },
            { name: true, description: undefined, rating: undefined },
            { name: [], description: undefined, rating: undefined },
            { name: 'test', description: 3, rating: undefined },
            { name: 'test', description: false, rating: undefined },
            { name: 'test', description: [], rating: undefined },
            { name: 'test', description: 'test', rating: 'test' },
            { name: 'test', description: 'test', rating: false },
            { name: 'test', description: 'test', rating: [] },
            { name: 'test', description: 'test', rating: -1 },
            { name: 'test', description: 'test', rating: 6 },
            { name: 'test', description: 'test', rating: Infinity },
        ])('create recipe with params name: $name, description: $description, rating: $rating', ({ name, description, rating }, done: jest.DoneCallback) => {
            agent
                .post('/recipes/')
                .send({ name: name, description: description, rating: rating })
                .expect(StatusCodes.BAD_REQUEST, done)
        })
    })
})