import prisma from '../../client'
import app from "../../app";
import { StatusCodes } from "http-status-codes";
import { agent as request } from "supertest";

export const agent = request(app);

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
    { name: 'test name 5', description: 'test description 5', rating: 3 },
    { name: 'test image', description: 'test description 5', rating: 3 },

];

describe('get all recipes', () => {
    describe('should return unprocessable entity on invalid arguments', () => {
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
                .expect(StatusCodes.UNPROCESSABLE_ENTITY, {
                    message: "Validation Failed",
                    details: { bonus: { message: "invalid boolean value", value: param } }
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

    it('should send status NOT FOUND if no recipe with ID is found', async () => {
        var response = await agent
            .get('/recipes/-1')
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No recipe with ID -1 exists in the database` })
    })
})

describe('create a recipe', () => {
    describe('should return unprocessable entity on invalid arguments', () => {
        it.each<any | jest.DoneCallback>(invalidRecipeArgs)
            ('create recipe with params name: $name, description: $description, rating: $rating', (invalidRecipeArgs, done: jest.DoneCallback) => {
                agent
                    .post('/recipes/')
                    .send(invalidRecipeArgs)
                    .expect(StatusCodes.UNPROCESSABLE_ENTITY, done)
            })
    })

    it('should send status NOT FOUND if an image ID is provided but it does not exist in de DB', async () => {
        var response = await agent
            .post('/recipes/')
            .send({ ...validRecipeArgs[0], imageId: -1 })
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No file with ID -1 exists in the database` })
    })

    describe('should create a recipe and return the recipe with an OK response status on valid arguments', () => {
        it.each<any | jest.DoneCallback>(validRecipeArgs)
            ('create recipe with params name: $name, description: $description, rating: $rating', async (validRecipeArgs) => {
                let response;

                if (validRecipeArgs.name == "test image") {
                    const image = await prisma.file.findFirst();

                    response = await agent
                        .post('/recipes/')
                        .send({ ...validRecipeArgs, imageId: image?.id })
                        .expect(StatusCodes.CREATED)
                } else {
                    response = await agent
                        .post('/recipes/')
                        .send(validRecipeArgs)
                        .expect(StatusCodes.CREATED)
                }

                expect(response.body.name).toBe(validRecipeArgs.name)
                expect(response.body.description == validRecipeArgs.description).toBeTruthy()
                expect(response.body.rating == validRecipeArgs.rating).toBeTruthy()

                const newRecipe = await prisma.recipe.findFirst({ where: { name: validRecipeArgs.name } });
                expect(newRecipe).not.toBeNull();

                await prisma.recipe.delete({ where: { id: newRecipe?.id } });
            })
    })
})

describe('update a recipe', () => {
    describe('should return unprocessable entity on invalid arguments', () => {
        it.each<any | jest.DoneCallback>(invalidRecipeArgs)
            ('update recipe with params name: $name, description: $description, rating: $rating', async (invalidRecipeArgs) => {
                const recipe = await prisma.recipe.findFirst();

                agent
                    .patch(`/recipes/${recipe?.id}`)
                    .send(invalidRecipeArgs)
                    .expect(StatusCodes.UNPROCESSABLE_ENTITY)
            })
    })

    it('should send status NOT FOUND if no recipe with ID is found', async () => {
        var response = await agent
            .patch('/recipes/-1')
            .send(validRecipeArgs[0])
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No recipe with ID -1 exists in the database` })
    })

    it('should send status NOT FOUND if an image ID is provided but it does not exist in de DB', async () => {
        const recipe = await prisma.recipe.findFirst();

        var response = await agent
            .patch(`/recipes/${recipe?.id}`)
            .send({ ...validRecipeArgs[0], imageId: -1 })
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No file with ID -1 exists in the database` })
    })

    describe('should update a recipe and return the recipe with an OK response status on valid arguments', () => {
        it.each<any | jest.DoneCallback>(validRecipeArgs)
            ('update recipe with params name: $name, description: $description, rating: $rating', async (validRecipeArgs) => {
                const recipe = await prisma.recipe.create({ data: validRecipeArgs });
                validRecipeArgs.name += ' updated';

                let response;

                if (validRecipeArgs.name == "test image updated") {
                    const image = await prisma.file.findFirst();

                    response = await agent
                        .patch(`/recipes/${recipe?.id}`)
                        .send({ ...validRecipeArgs, imageId: image?.id })
                        .expect(StatusCodes.OK)
                } else {
                    response = await agent
                        .patch(`/recipes/${recipe?.id}`)
                        .send(validRecipeArgs)
                        .expect(StatusCodes.OK)
                }

                expect(response.body.id).toBe(recipe?.id)
                expect(response.body.name).toBe(validRecipeArgs.name)
                expect(validRecipeArgs.description != undefined ? response.body.description == validRecipeArgs.description : response.body.description == recipe?.description).toBeTruthy()
                expect(validRecipeArgs.rating != undefined ? response.body.rating == validRecipeArgs.rating : response.body.rating == recipe?.rating).toBeTruthy()

                const updatedRecipe = await prisma.recipe.findFirst({ where: { name: validRecipeArgs.name } });
                expect(updatedRecipe).not.toBeNull();

                await prisma.recipe.delete({ where: { id: updatedRecipe?.id } });
            })
    })
})

describe('delete a recipe', () => {
    it('should delete a recipe and return with an OK response status', async () => {
        const recipe = await prisma.recipe.create({ data: validRecipeArgs[0] });

        await agent
            .delete(`/recipes/${recipe?.id}`)
            .expect(StatusCodes.OK)

        const deletedRecipe = await prisma.recipe.findUnique({
            where: {
                id: recipe?.id
            }
        })

        expect(deletedRecipe).toBeNull();
    });

    it('should send status NOT FOUND if no recipe with ID is found', async () => {
        var response = await agent
            .delete('/recipes/-1')
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No recipe with ID -1 exists in the database` })
    })
})

describe('suggest recipes', () => {
    it('should set and then send several recipes and return with an OK response status', async () => {
        await agent
            .put('/recipes/suggest')
            .expect(StatusCodes.OK)

        const response = await agent
            .get('/recipes/suggest')
            .expect(StatusCodes.OK)

        const allRecipes = await prisma.recipe.findMany({})
        expect(response.body.length).toBe(Math.min(allRecipes.length, 7));
    })
})

describe('search recipes', () => {
    it.each<any | jest.DoneCallback>(["a", "b"])
        ('should return unprocessable entity on invalid arguments with one character', async (query) => {
            await agent
                .get('/recipes/search')
                .query({ query: query })
                .expect(StatusCodes.UNPROCESSABLE_ENTITY);
        });

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
        const recipe = await prisma.recipe.findFirst({ where: { name: 'test recipe 2' } });

        const recipeResponse = await agent
            .get(`/recipes/${recipe?.id}`)
            .expect(StatusCodes.OK);

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
        const recipe = await prisma.recipe.findFirst({ where: { name: 'test recipe 2' } });

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

describe('search Albert Heijn recipes', () => {
    it.each<any | jest.DoneCallback>(["a", "b"])
        ('should return unprocessable entity on invalid arguments with one character', async (query) => {
            await agent
                .get('/recipes/ah/search')
                .query({ query: query })
                .expect(StatusCodes.UNPROCESSABLE_ENTITY);
        });

    it('should return with an OK response status', async () => {
        await agent
            .get('/recipes/ah/search')
            .query({ query: "anything" })
            .expect(StatusCodes.OK);
    })
})

// TODO fix AH API calls
// describe('get Albert Heijn recipe by ID', () => {
//     it.each<any | jest.DoneCallback>(["a", 1.5, false])
//         ('should return unprocessable entity on invalid arguments', async (id) => {
//             await agent
//                 .get(`/recipes/ah/${id}`)
//                 .expect(StatusCodes.UNPROCESSABLE_ENTITY);
//         });

//     it('should return with an OK response status', async () => {
//         var recipes = await agent
//             .get('/recipes/ah/search')
//             .query({ query: "te" })
//             .expect(StatusCodes.OK);

//         await agent
//             .get(`/recipes/ah/${recipes.body[0].id}`)
//             .expect(StatusCodes.OK);
//     })
// })