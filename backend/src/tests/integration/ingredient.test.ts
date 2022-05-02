import prisma from '../../client'
import app from "../../app";
import { StatusCodes } from "http-status-codes";
import { agent as request } from "supertest";

export const agent = request(app);

const invalidArgs = [
    {},
    { name: null },
    { name: '' },
    { name: 3 },
    { name: true },
    { name: [] },
    { name: 'test', ahId: 'test' },
    { name: 'test', ahId: false },
    { name: 'test', ahId: [] },
    { name: 'test', unitSize: false },
    { name: 'test', unitSize: [] },
    { name: 'test', unitSize: 1 },
    { name: 'test', price: -1 },
    { name: 'test', price: 'test' },
    { name: 'test', price: false },
    { name: 'test', price: [] },
    { name: 'test', category: false },
    { name: 'test', category: [] },
    { name: 'test', category: 1 },
    { name: 'test', isBonus: 'test' },
    { name: 'test', isBonus: [] },
    { name: 'test', isBonus: 0 },
    { name: 'test', bonusMechanism: false },
    { name: 'test', bonusMechanism: [] },
    { name: 'test', bonusMechanism: 1 },
    { name: 'test', bonusPrice: -1 },
    { name: 'test', bonusPrice: 'test' },
    { name: 'test', bonusPrice: false },
    { name: 'test', bonusPrice: [] },
    { name: 'test', image: false },
    { name: 'test', image: [] },
    { name: 'test', image: 1 },
    { name: 'test', image: "test" },
];

const validArgs = [
    { name: 'test create 0' },
    { name: 'test create 1', ahId: 69, unitSize: "150 g", price: 0, category: "Kaas, vleeswaren, tapas", isBonus: true, bonusMechanism: "25% korting", bonusPrice: 0, image: "https://www.example.com/" },
    { name: 'test create 2', ahId: 42, unitSize: "150 g", price: 1.29, category: "Kaas, vleeswaren, tapas", isBonus: true, bonusMechanism: "25% korting", bonusPrice: 0.97, image: "https://example.net/test.png" },
];

describe('get all ingredients', () => {
    describe('should return unprocessable entity on invalid arguments', () => {
        it.each<any>([
            { limit: 0 },
            { limit: 1001 },
            { limit: 'test' },
            { limit: '$' },
            { limit: false },
            { limit: 1.5 },
            { page: 'test' },
            { page: '$' },
            { page: false },
            { page: 1.5 },
            { limit: 20, page: 1.5 },
            { limit: 1.5, page: 0 },
        ])('query param bonus: %s', async (params) => {
            await agent
                .get('/ingredients/')
                .query(params)
                .expect(StatusCodes.UNPROCESSABLE_ENTITY)
        })
    })

    it('should return ok status and 20 ingredients with no query params', async () => {
        const response = await agent
            .get('/ingredients/')
            .expect(StatusCodes.OK);

        expect(response.body.length).toBe(20);
    })

    it.each<number>([1, 42, 1000])
        ('should return ok status and the correct amount ingredients with limit param set', async (limit) => {
            const response = await agent
                .get('/ingredients/')
                .query({ limit: limit })
                .expect(StatusCodes.OK);

            expect(response.body.length).toBe(limit);
        });

    it('should return ok status and ingredients with page param set', async () => {
        const response1 = await agent
            .get('/ingredients/')
            .query({ limit: 1 })
            .expect(StatusCodes.OK)

        const response2 = await agent
            .get('/ingredients/')
            .query({ limit: 1, page: 1 })
            .expect(StatusCodes.OK)

        expect(response1.body.length).toBe(1);
        expect(response2.body.length).toBe(1);

        expect(response1.body[0]).not.toEqual(response2.body[0])
    })
})

describe('get a ingredient by ID', () => {
    it('should return ok status and the ingredient with the corresponding ID', async () => {
        const ingredient = await prisma.ingredient.findFirst();

        const response = await agent
            .get(`/ingredients/${ingredient?.id}`)
            .expect(StatusCodes.OK)

        expect(response.body.id).toBe(ingredient?.id);
        expect(response.body.name).toBe(ingredient?.name);
    })

    it('should send status NOT FOUND if no recipe with ID is found', async () => {
        var response = await agent
            .get('/ingredients/-1')
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No ingredient with ID -1 exists in the database` })
    })
})

describe('get a ingredient price history by ingredient ID', () => {
    it('should return ok status and the ingredient price history with the corresponding ID', async () => {
        const ingredient = await prisma.ingredient.findFirst();

        const priceHistories = Array.from(new Array(2), (_, index) => {
            return {
                ingredientId: ingredient?.id || 1,
                isBonus: index % 2 == 0,
                price: index,
                from: new Date(),
            }
        })

        await prisma.ingredientPriceHistory.createMany({
            data: priceHistories
        })

        const response = await agent
            .get(`/ingredients/${ingredient?.id}/priceHistory`)
            .expect(StatusCodes.OK)

        expect(response.body.length).toBe(2);
        expect(response.body.map((hist: { ingredientId: any; }) => hist.ingredientId)).toStrictEqual([ingredient?.id, ingredient?.id]);
    })

    it('should send status NOT FOUND if no recipe with ID is found', async () => {
        var response = await agent
            .get('/ingredients/-1/priceHistory')
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No ingredient with ID -1 exists in the database` })
    })
})

describe('search Albert Heijn ingredients', () => {
    it.each<any | jest.DoneCallback>(["a", "b"])
        ('should return unprocessable entity on invalid arguments with one character', async (query) => {
            await agent
                .get('/ingredients/ah/search')
                .query({ query: query })
                .expect(StatusCodes.UNPROCESSABLE_ENTITY);
        });

    it('should return with an OK response status', async () => {
        await agent
            .get('/ingredients/ah/search')
            .query({ query: "anything" })
            .expect(StatusCodes.OK);
    })
})

describe('get ingredient by AH ID', () => {
    it.each<any | jest.DoneCallback>(["a", 1.5, false])
        ('should return unprocessable entity on invalid arguments', async (id) => {
            await agent
                .get(`/ingredients/ah/${id}`)
                .expect(StatusCodes.UNPROCESSABLE_ENTITY);
        });

    it('should return with an OK response status', async () => {
        const ingredient = await prisma.ingredient.findFirst({ where: { NOT: { id: undefined } } });

        await agent
            .get(`/ingredients/ah/${ingredient?.ahId}`)
            .expect(StatusCodes.OK);
    })
})

describe('create a ingredient', () => {
    describe('should return unprocessable entity on invalid arguments', () => {
        it.each<any | jest.DoneCallback>(invalidArgs)
            ('create ingredient with invalid params', (invalidArgs, done: jest.DoneCallback) => {
                agent
                    .post('/ingredients/')
                    .send(invalidArgs)
                    .expect(StatusCodes.UNPROCESSABLE_ENTITY, done)
            })
    })

    it('should return conflict on creating ingredient with ahId that is already coupled to another ingredient', async () => {
        await agent
            .post('/ingredients/')
            .send({ name: "conflict", ahId: 0 })
            .expect(StatusCodes.CONFLICT);
    })

    describe('should create a ingredient and return the ingredient with an OK response status on valid arguments', () => {
        it.each<any | jest.DoneCallback>(validArgs)
            ('create recipe with valid params', async (validArgs) => {

                const response = await agent
                    .post('/ingredients/')
                    .send(validArgs)
                    .expect(StatusCodes.CREATED)

                expect(response.body.name).toBe(validArgs.name)
                expect(response.body.ahId == validArgs.ahId).toBeTruthy()
                expect(response.body.unitSize == validArgs.unitSize).toBeTruthy()
                expect(response.body.price == validArgs.price).toBeTruthy()
                expect(response.body.category == validArgs.category).toBeTruthy()
                expect(response.body.isBonus == validArgs.isBonus).toBeTruthy()
                expect(response.body.bonusMechanism == validArgs.bonusMechanism).toBeTruthy()
                expect(response.body.bonusPrice == validArgs.bonusPrice).toBeTruthy()
                expect(response.body.image == validArgs.image).toBeTruthy()

                const newIngredient = prisma.ingredient.findFirst({ where: { name: validArgs.name } });
                expect(newIngredient).not.toBeNull();

            })
    })
})

describe('update a ingredient', () => {
    describe('should return unprocessable entity on invalid arguments', () => {
        it.each<any | jest.DoneCallback>(invalidArgs)
            ('update ingredient with invalid params', async (invalidArgs) => {
                const ingredient = await prisma.ingredient.findFirst();

                agent
                    .patch(`/ingredients/${ingredient?.id}`)
                    .send(invalidArgs)
                    .expect(StatusCodes.UNPROCESSABLE_ENTITY)
            })
    })

    it('should send status NOT FOUND if no ingredient with ID is found', async () => {
        var response = await agent
            .patch('/ingredients/-1')
            .send(validArgs[0])
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No ingredient with ID -1 exists in the database` })
    })

    describe('should update a ingredient and return the ingredient with an OK response status on valid arguments', () => {
        it.each<any | jest.DoneCallback>(validArgs)
            ('update ingredient with valid params', async (validArgs) => {
                const ingredient = await prisma.ingredient.findFirst({ where: { name: validArgs.name } });
                validArgs.name += ' updated';

                const response = await agent
                    .patch(`/ingredients/${ingredient?.id}`)
                    .send(validArgs)
                    .expect(StatusCodes.OK)

                expect(response.body.id).toBe(ingredient?.id)
                expect(response.body.name).toBe(validArgs.name)
                expect(response.body.ahId == validArgs.ahId).toBeTruthy()
                expect(response.body.unitSize == validArgs.unitSize).toBeTruthy()
                expect(response.body.price == validArgs.price).toBeTruthy()
                expect(response.body.category == validArgs.category).toBeTruthy()
                expect(response.body.isBonus == validArgs.isBonus).toBeTruthy()
                expect(response.body.bonusMechanism == validArgs.bonusMechanism).toBeTruthy()
                expect(response.body.bonusPrice == validArgs.bonusPrice).toBeTruthy()
                expect(response.body.image == validArgs.image).toBeTruthy()

                const updatedIngredient = prisma.ingredient.findFirst({ where: { name: validArgs.name } });
                expect(updatedIngredient).not.toBeNull();
            })
    })
})

describe('delete a ingredient', () => {
    it('should delete a recipe and return with an OK response status', async () => {
        const ingredient = await prisma.ingredient.findFirst({ where: { name: { contains: validArgs[0].name } } });

        await agent
            .delete(`/ingredients/${ingredient?.id}`)
            .expect(StatusCodes.OK)

        const deletedIngredient = await prisma.ingredient.findUnique({
            where: {
                id: ingredient?.id
            }
        })

        expect(deletedIngredient).toBeNull()
    })

    it('should send status NOT FOUND if no ingredient with ID is found', async () => {
        var response = await agent
            .delete('/ingredients/-1')
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No ingredient with ID -1 exists in the database` })
    })
})