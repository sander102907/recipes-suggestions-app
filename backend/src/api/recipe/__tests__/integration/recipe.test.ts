import prisma from '../../../../client'
import { agent as request } from "supertest";
import server from "../../../../server";
import { StatusCodes } from "http-status-codes";
import { seedDatabaseWithData, clearDatabase } from '../../../../jest/helpers';

const agent = request(server);

const invalidRecipeArgs = [
    {},
    { name: null },
    { name: '' },
    { name: 3 },
    { name: true },
    { name: [] },
    { name: 'test', description: 3 },
    { name: 'test', description: false },
    { name: 'test', description: [] },
    { name: 'test', rating: 'test' },
    { name: 'test', rating: false },
    { name: 'test', rating: [] },
    { name: 'test', rating: 0 },
    { name: 'test', rating: -1 },
    { name: 'test', rating: 6 },
    { name: 'test', rating: 2.5 },
    { name: 'test', rating: Infinity },
];

const validRecipeArgs = [
    { name: 'test name 0' },
    { name: 'test name 1', description: 'test description 1' },
    { name: 'test name 2', description: 'test description 2', rating: 1 },
    { name: 'test name 3', rating: 1 },
    { name: 'test name 4', description: 'test description 4', rating: 5 },
    { name: 'test name 5', description: 'test description 5', rating: 3 },
];

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
})

describe('create a recipe', () => {
    describe('should return bad request on invalid arguments', () => {
        it.each<any | jest.DoneCallback>(invalidRecipeArgs)
            ('create recipe with params name: $name, description: $description, rating: $rating', ({ name, description, rating }, done: jest.DoneCallback) => {
                agent
                    .post('/recipes/')
                    .send({ name: name, description: description, rating: rating })
                    .expect(StatusCodes.BAD_REQUEST, done)
            })
    })

    describe('should create a recipe and return the recipe with an OK response status on valid arguments', () => {
        it.each<any | jest.DoneCallback>(validRecipeArgs)
            ('create recipe with params name: $name, description: $description, rating: $rating', async ({ name, description, rating }) => {
                const response = await agent
                    .post('/recipes/')
                    .send({
                        name: name,
                        ...(description && { description: description }),
                        ...(rating && { rating: rating })
                    })
                    .expect(StatusCodes.OK)

                expect(response.body.name).toBe(name)
                expect(response.body.description == description).toBeTruthy()
                expect(response.body.rating == rating).toBeTruthy()

                const newRecipe = prisma.recipe.findFirst({ where: { name: name } });
                expect(newRecipe).not.toBeNull();

            })
    })
})

describe('update a recipe', () => {
    describe('should return bad request on invalid arguments', () => {
        it.each<any | jest.DoneCallback>(invalidRecipeArgs)
            ('update recipe with params name: $name, description: $description, rating: $rating', async ({ name, description, rating }) => {
                const recipe = await prisma.recipe.findFirst();

                agent
                    .put(`/recipes/${recipe?.id}`)
                    .send({ name: name, description: description, rating: rating })
                    .expect(StatusCodes.BAD_REQUEST)
            })
    })

    describe('should update a recipe and return the recipe with an OK response status on valid arguments', () => {
        it.each<any | jest.DoneCallback>(validRecipeArgs)
            ('update recipe with params name: $name, description: $description, rating: $rating', async ({ name, description, rating }) => {
                const recipe = await prisma.recipe.findFirst({ where: { name: name } });
                name = name + 'updated';

                const response = await agent
                    .put(`/recipes/${recipe?.id}`)
                    .send({
                        name: name,
                        ...(description && { description: description }),
                        ...(rating && { rating: rating })
                    })
                    .expect(StatusCodes.OK)

                expect(response.body.id).toBe(recipe?.id)
                expect(response.body.name).toBe(name)
                expect(description != undefined ? response.body.description == description : response.body.description == recipe?.description).toBeTruthy()
                expect(rating != undefined ? response.body.rating == rating : response.body.rating == recipe?.rating).toBeTruthy()

                const updatedRecipe = prisma.recipe.findFirst({ where: { name: name } });
                expect(updatedRecipe).not.toBeNull();
            })
    })
})

describe('delete a recipe', () => {
    it('should delete a recipe and return with an OK response status', async () => {
        const recipe = await prisma.recipe.findFirst({ where: { name: { contains: validRecipeArgs[0].name } } });

        await agent
            .delete(`/recipes/${recipe?.id}`)
            .expect(StatusCodes.OK)

        const deletedRecipe = await prisma.recipe.findUnique({
            where: {
                id: recipe?.id
            }
        })

        expect(deletedRecipe).toBeNull()
    })
})

describe('suggest recipes', () => {
    it('should send several recipes and return with an OK response status', async () => {

        const response = await agent
            .get('/recipes/suggest')
            .expect(StatusCodes.OK)

        const allRecipes = await prisma.recipe.findMany({})
        expect(response.body.length).toBe(Math.min(allRecipes.length, 7));
    })
})

describe('search recipes', () => {
    it('should send recipe(s) with name that matches the search term and return with an OK response status', async () => {
        const recipe = await prisma.recipe.findFirst({ where: { name: 'test recipe 0' } });

        const response = await agent
            .get('/recipes/search')
            .query({ query: recipe?.name })
            .expect(StatusCodes.OK)

        expect(response.body.length).toBe(1);
        expect(response.body[0].id).toBe(recipe?.id)
        expect(response.body[0].name).toBe(recipe?.name)
        expect(response.body[0].description).toBe(recipe?.description)
        expect(response.body[0].rating).toBe(recipe?.rating)
    })

    it('should send recipe(s) with name that partially matches the search term and return with an OK response status', async () => {
        const recipe = await prisma.recipe.findFirst({ where: { name: 'test recipe 0' } });

        const response = await agent
            .get('/recipes/search')
            .query({ query: recipe?.name.slice(0, -3) })
            .expect(StatusCodes.OK)

        expect(response.body.length).toBe(3);
        expect(response.body[0].name).toContain(recipe?.name.slice(0, -3))
        expect(response.body[1].name).toContain(recipe?.name.slice(0, -3))
        expect(response.body[2].name).toContain(recipe?.name.slice(0, -3))
    })

    it('should send recipe(s) with ingredient that matches the search term and return with an OK response status', async () => {
        const recipe = await prisma.recipe.findFirst({ where: { name: 'test recipe 0' } });

        const recipeResponse = await agent
            .get(`/recipes/${recipe?.id}`)
            .expect(StatusCodes.OK)

        const ingredient = recipeResponse.body.recipeIngredientsGroups[0].ingredientsInGroup[0].ingredient;

        const response = await agent
            .get('/recipes/search')
            .query({ query: ingredient?.name })
            .expect(StatusCodes.OK)

        expect(response.body.length).toBe(1);
        expect(response.body[0].id).toBe(recipe?.id)
        expect(response.body[0].name).toBe(recipe?.name)
        expect(response.body[0].description).toBe(recipe?.description)
        expect(response.body[0].rating).toBe(recipe?.rating)
    })

    it('should send recipe(s) with ingredient name that partially matches the search term and return with an OK response status', async () => {
        const recipe = await prisma.recipe.findFirst({ where: { name: 'test recipe 0' } });

        const recipeResponse = await agent
            .get(`/recipes/${recipe?.id}`)
            .expect(StatusCodes.OK)

        const ingredient = recipeResponse.body.recipeIngredientsGroups[0].ingredientsInGroup[0].ingredient;

        const response = await agent
            .get('/recipes/search')
            .query({ query: ingredient?.name.slice(0, -3) })
            .expect(StatusCodes.OK)

        expect(response.body.length).toBe(3);
    })
})