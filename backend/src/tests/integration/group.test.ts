import prisma from '../../client'
import app from "../../app";
import { StatusCodes } from "http-status-codes";
import { agent as request } from "supertest";

export const agent = request(app);

const invalidGroupArgs = [
    {},
    { recipeId: 1.5 },
    { recipeId: "test ID" },
    { recipeId: 42, ingredientsInGroup: 3 },
    { recipeId: 42, ingredientsInGroup: "test" },
    { recipeId: 42, ingredientsInGroup: [{ ingredientId: 1.5 }] },
    { recipeId: 42, ingredientsInGroup: [{ ingredientId: "test ID" }] },
    { recipeId: 42, ingredientsInGroup: [{ ingredientId: 69, amount: "test amount" }] },
    { recipeId: 42, ingredientsInGroup: [{ ingredientId: 69, amount: 1.5 }] },
    { recipeId: 42, ingredientsInGroup: [{ ingredientId: 69, amount: 0 }] },
    { recipeId: 42, ingredientsInGroup: [{ ingredientId: 69, amount: -1 }] },
    { ingredientsInGroup: [{ ingredientId: 69 }] },
];

describe('get all groups', () => {
    describe('should return unprocessable entity on invalid arguments', () => {
        it.each<any | jest.DoneCallback>([
            { recipeId: 1.5 },
            { recipeId: "test ID" },
            { ingredientId: 1.5 },
            { ingredientId: "test ID" }
        ])('', (query, done: jest.DoneCallback) => {
            agent
                .get('/groups/')
                .query(query)
                .expect(StatusCodes.UNPROCESSABLE_ENTITY, done)
        })
    })

    it('should return bad request status when both recipe ID and ingredient ID are set', async () => {
        const response = await agent
            .get('/groups/')
            .query({ recipeId: 42, ingredientId: 69 })
            .expect(StatusCodes.BAD_REQUEST);

        expect(response.body).toStrictEqual({ reason: `recipeId and ingredientId cannot both be set. Include either one of them, or none.` });
    })

    it('should return ok status and all groups with no query params', async () => {
        const response = await agent
            .get('/groups/')
            .expect(StatusCodes.OK);

        expect(response.body.length).toBe(6);
    })

    it('should return ok status and all groups with a specified ingredient', async () => {
        const ingredient = await prisma.ingredient.findFirst();

        const response = await agent
            .get('/groups/')
            .query({ ingredientId: ingredient?.id })
            .expect(StatusCodes.OK);

        expect(response.body.length).toBe(1);
    })

    it('should return ok status and all groups of a specified recipe', async () => {
        const recipe = await prisma.recipe.findFirst();

        const response = await agent
            .get('/groups/')
            .query({ recipeId: recipe?.id })
            .expect(StatusCodes.OK);

        expect(response.body.length).toBe(2);
    })
})

describe('get a group by ID', () => {
    it('should return ok status and the group with the corresponding ID', async () => {
        const group = await prisma.recipeIngredientsGroup.findFirst();

        const response = await agent
            .get(`/groups/${group?.id}`)
            .expect(StatusCodes.OK)

        expect(response.body.id).toBe(group?.id);
        expect(response.body.recipeId).toBe(group?.recipeId);
    })

    it('should send status NOT FOUND if no group with ID is found', async () => {
        const response = await agent
            .get('/groups/-1')
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No group with ID -1 exists in the database` })
    })
})

describe('create a group', () => {
    describe('should return unprocessable entity on invalid arguments', () => {
        it.each<any | jest.DoneCallback>(invalidGroupArgs)
            ('create recipe with params name: $name, description: $description, rating: $rating', (invalidGroupArgs, done: jest.DoneCallback) => {
                agent
                    .post('/groups/')
                    .send(invalidGroupArgs)
                    .expect(StatusCodes.UNPROCESSABLE_ENTITY, done)
            })
    })

    it('should send status NOT FOUND if the corresponding recipe does not exist in de DB', async () => {
        const response = await agent
            .post('/groups/')
            .send({ recipeId: -1 })
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No recipe with ID -1 exists in the database` })
    })

    describe('should create a group and return the group with an CREATED response status on valid arguments', () => {
        it('Create using only a recipe ID', async () => {
            const recipe = await prisma.recipe.findFirst();

            const response = await agent
                .post('/groups/')
                .send({ recipeId: recipe?.id })
                .expect(StatusCodes.CREATED);

            expect(response.body.recipeId).toBe(recipe?.id);

            const newGroup = prisma.recipeIngredientsGroup.findFirst({ where: { recipeId: recipe?.id } });
            expect(newGroup).not.toBeNull();
        });

        it('Create using a recipe ID and ingredients', async () => {
            const recipe = await prisma.recipe.findFirst();
            const ingredients = await prisma.ingredient.findMany({ take: 2 });

            const ingredientsInGroup = [
                { ingredientId: ingredients[0].id },
                { ingredientId: ingredients[1].id, amount: 42 },
            ]

            const response = await agent
                .post('/groups/')
                .send({
                    recipeId: recipe?.id,
                    ingredientsInGroup: ingredientsInGroup
                })
                .expect(StatusCodes.CREATED);

            expect(response.body.recipeId).toBe(recipe?.id);


            const newGroup = await prisma.recipeIngredientsGroup.findFirst({ where: { ingredientsInGroup: { some: { amount: 42 } } }, include: { ingredientsInGroup: true } });
            expect(newGroup).not.toBeNull();
            expect(newGroup?.recipeId).toStrictEqual(recipe?.id);
        });
    })
})

describe('add a ingredient to a group', () => {
    describe('should return unprocessable entity on invalid arguments', () => {
        it.each<any | jest.DoneCallback>([
            {},
            { groupId: 1 },
            { ingredientId: 1 },
            { groupId: 1.5, ingredientId: 1 },
            { groupId: "test ID", ingredientId: 1 },
            { groupId: 1, ingredientId: 1.5 },
            { groupId: 1, ingredientId: 1.5 },
            { groupId: 1, ingredientId: 1, amount: 1.5 },
            { groupId: 1, ingredientId: 1.5, amount: "test amount" },
        ])
            ('update recipe with params name: $name, groupId: $groupId, ingredientId: $ingredientId, amount: $amount', async (invalidArgs) => {
                await agent
                    .put('/groups/ingredient/add')
                    .send(invalidArgs)
                    .expect(StatusCodes.UNPROCESSABLE_ENTITY)
            });
    });

    it('should send status NOT FOUND if no group with ID is found', async () => {
        const response = await agent
            .put('/groups/ingredient/add')
            .send({ groupId: -1, ingredientId: 1 })
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No group with ID -1 exists in the database` })
    });

    it('should send status NOT FOUND if no ingredient with ID is found', async () => {
        const group = await prisma.recipeIngredientsGroup.findFirst();

        const response = await agent
            .put('/groups/ingredient/add')
            .send({ groupId: group?.id, ingredientId: -1 })
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No ingredient with ID -1 exists in the database` })
    })

    describe('should add ingredient to group and return the group with an OK response status on valid arguments', () => {
        it.each<any | jest.DoneCallback>([
            {},
            { amount: 1 },
            { amount: 42 }
        ])
            ('if the ingredient is not already in the group, add it with the correct amount: $amount', async (amountParams) => {
                const ingredient = await prisma.ingredient.findFirst();
                const group = await prisma.recipeIngredientsGroup.findFirst({ where: { ingredientsInGroup: { none: { ingredientId: ingredient?.id } } } });

                const response = await agent
                    .put('/groups/ingredient/add')
                    .send({ ingredientId: ingredient?.id, groupId: group?.id, ...amountParams })
                    .expect(StatusCodes.OK);

                expect(response.body.ingredientId).toBe(ingredient?.id);
                expect(response.body.groupId).toBe(group?.id);

                const ingredientsInGroup = await prisma.ingredientsInGroup.findFirst({ where: { groupId: group?.id, ingredientId: ingredient?.id } });
                expect(ingredientsInGroup).not.toBeNull();

                if (amountParams.amount) {
                    expect(response.body.amount).toBe(amountParams.amount);
                    expect(ingredientsInGroup?.amount).toBe(amountParams.amount);
                } else {
                    expect(response.body.amount).toBe(1);
                    expect(ingredientsInGroup?.amount).toBe(1);
                }
            })

        it.each<any | jest.DoneCallback>([
            {},
            { amount: 1 },
            { amount: 42 }
        ])
            ('if the ingredient is already in the group, add it with the correct amount: $amount', async (amountParams) => {
                const ingredient = await prisma.ingredient.findFirst();
                const group = await prisma.recipeIngredientsGroup.findFirst({
                    where: {
                        ingredientsInGroup: {
                            some: {
                                ingredientId: ingredient?.id
                            }
                        }
                    },
                    include: { ingredientsInGroup: true }
                });

                const response = await agent
                    .put('/groups/ingredient/add')
                    .send({ ingredientId: ingredient?.id, groupId: group?.id, ...amountParams })
                    .expect(StatusCodes.OK);

                expect(response.body.ingredientId).toBe(ingredient?.id);
                expect(response.body.groupId).toBe(group?.id);

                const ingredientsInGroup = await prisma.ingredientsInGroup.findFirst({ where: { groupId: group?.id, ingredientId: ingredient?.id } });
                expect(ingredientsInGroup).not.toBeNull();

                const currentAmount = group?.ingredientsInGroup.filter(group => group.ingredientId == ingredient?.id)[0].amount;

                if (amountParams.amount) {
                    const newAmount = currentAmount + amountParams.amount;
                    expect(response.body.amount).toBe(newAmount);
                    expect(ingredientsInGroup?.amount).toBe(newAmount);
                } else {
                    const newAmount = (currentAmount ? currentAmount : 0) + 1;
                    expect(response.body.amount).toBe(newAmount);
                    expect(ingredientsInGroup?.amount).toBe(newAmount);
                }
            })
    })
})

describe('subtract a ingredient from a group', () => {
    describe('should return unprocessable entity on invalid arguments', () => {
        it.each<any | jest.DoneCallback>([
            {},
            { groupId: 1 },
            { ingredientId: 1 },
            { groupId: 1.5, ingredientId: 1 },
            { groupId: "test ID", ingredientId: 1 },
            { groupId: 1, ingredientId: 1.5 },
            { groupId: 1, ingredientId: 1.5 },
            { groupId: 1, ingredientId: 1, amount: 1.5 },
            { groupId: 1, ingredientId: 1.5, amount: "test amount" },
        ])
            ('update recipe with params name: $name, groupId: $groupId, ingredientId: $ingredientId, amount: $amount', async (invalidArgs) => {
                await agent
                    .put('/groups/ingredient/subtract')
                    .send(invalidArgs)
                    .expect(StatusCodes.UNPROCESSABLE_ENTITY)
            });
    });

    it('should send status NOT FOUND if no group with ID is found', async () => {
        const response = await agent
            .put('/groups/ingredient/subtract')
            .send({ groupId: -1, ingredientId: 1 })
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No group with ID -1 exists in the database` })
    });

    it('should send status NOT FOUND if no ingredient with ID is found', async () => {
        const group = await prisma.recipeIngredientsGroup.findFirst();

        const response = await agent
            .put('/groups/ingredient/subtract')
            .send({ groupId: group?.id, ingredientId: -1 })
            .expect(StatusCodes.NOT_FOUND)

        expect(response.body).toStrictEqual({ reason: `No ingredient with ID -1 exists in the database` })
    })

    describe('should subtract ingredient from a group and return an OK response status on valid arguments', () => {
        it('if the ingredient is not in the group, do nothing', async () => {
            const ingredient = await prisma.ingredient.findFirst();
            const group = await prisma.recipeIngredientsGroup.findFirst({ where: { ingredientsInGroup: { none: { ingredientId: ingredient?.id } } }, include: { ingredientsInGroup: true } });

            await agent
                .put('/groups/ingredient/subtract')
                .send({ ingredientId: ingredient?.id, groupId: group?.id })
                .expect(StatusCodes.OK);

            // Check that the ingredient is still not in the group (so not with a negative amount)
            expect(group?.ingredientsInGroup.filter(group => group.ingredientId === ingredient?.id).length).toBe(0);
        })

        it.each<any | jest.DoneCallback>([
            {},
            { amount: 1 },
            { amount: 42 }
        ])
            ('if the ingredient is in the group, subtract the correct amount', async (amountParams) => {
                const recipe = await prisma.recipe.findFirst();
                const ingredient = await prisma.ingredient.findFirst();

                // Add ingredient to a group with amount + 1
                const group = await prisma.recipeIngredientsGroup.create({
                    data: {
                        recipeId: recipe?.id || 1,
                        ingredientsInGroup: {
                            createMany: {
                                data: [
                                    { ingredientId: ingredient?.id || 1, amount: amountParams.amount ? amountParams.amount + 1 : 2 }
                                ]
                            }
                        }
                    }
                });

                await agent
                    .put('/groups/ingredient/subtract')
                    .send({ ingredientId: ingredient?.id, groupId: group?.id, ...amountParams })
                    .expect(StatusCodes.OK);

                const ingredientsInGroup = await prisma.ingredientsInGroup.findFirst({ where: { groupId: group?.id, ingredientId: ingredient?.id } });
                expect(ingredientsInGroup).not.toBeNull();

                const updatedGroup = await prisma.recipeIngredientsGroup.findUnique({ where: { id: group.id }, include: { ingredientsInGroup: true } });

                const newAmount = updatedGroup?.ingredientsInGroup.filter(group => group.ingredientId == ingredient?.id)[0].amount;

                expect(newAmount).toBe(1);
            })

        it.each<any | jest.DoneCallback>([
            {},
            { amount: 1 },
            { amount: 42 }
        ])
            ('if the ingredient is in the group and the subtracted amount is equal to the current amount, remove the ingredient from the group', async (amountParams) => {
                const recipe = await prisma.recipe.findFirst();
                const ingredient = await prisma.ingredient.findFirst();

                // Add ingredient to a group with amount + 1
                const group = await prisma.recipeIngredientsGroup.create({
                    data: {
                        recipeId: recipe?.id || 1,
                        ingredientsInGroup: {
                            createMany: {
                                data: [
                                    { ingredientId: ingredient?.id || 1, amount: amountParams.amount ? amountParams.amount : 1 }
                                ]
                            }
                        }
                    }
                });

                await agent
                    .put('/groups/ingredient/subtract')
                    .send({ ingredientId: ingredient?.id, groupId: group?.id, ...amountParams })
                    .expect(StatusCodes.OK);

                const ingredientsInGroup = await prisma.ingredientsInGroup.findFirst({ where: { groupId: group?.id, ingredientId: ingredient?.id } });
                expect(ingredientsInGroup).toBeNull();
            });

        it('if the ingredient is in the group and the subtracted amount is greater than the current amount, remove the ingredient from the group', async () => {
            const recipe = await prisma.recipe.findFirst();
            const ingredient = await prisma.ingredient.findFirst();

            // Add ingredient to a group with amount + 1
            const group = await prisma.recipeIngredientsGroup.create({
                data: {
                    recipeId: recipe?.id || 1,
                    ingredientsInGroup: {
                        createMany: {
                            data: [
                                { ingredientId: ingredient?.id || 1, amount: 41 }
                            ]
                        }
                    }
                }
            });

            await agent
                .put('/groups/ingredient/subtract')
                .send({ ingredientId: ingredient?.id, groupId: group?.id, amount: 42 })
                .expect(StatusCodes.OK);

            const ingredientsInGroup = await prisma.ingredientsInGroup.findFirst({ where: { groupId: group?.id, ingredientId: ingredient?.id } });
            expect(ingredientsInGroup).toBeNull();
        })
    })
})

describe('remove all groups from a recipe', () => {
    it('should return with an OK response status and remove all groups from the recipe', async () => {
        const recipe = await prisma.recipe.create({
            data: {
                name: "remove all groups from recipe",
                recipeIngredientsGroups: {
                    createMany: {
                        data: [
                            {},
                            {},
                            {}
                        ]
                    }
                }
            }
        })

        await agent
            .delete(`/groups/recipe/${recipe.id}`)
            .expect(StatusCodes.OK)

        const updatedRecipe = await prisma.recipe.findUnique({ where: { id: recipe.id }, include: { recipeIngredientsGroups: true } });
        expect(updatedRecipe?.recipeIngredientsGroups.length).toBe(0);
        await prisma.recipe.delete({ where: { id: recipe.id } });
    })
})

describe('remove all ingredients from a group', () => {
    it('should return with an OK response status and remove all ingredients from the group', async () => {
        const recipe = await prisma.recipe.findFirst();
        const ingredient = await prisma.ingredient.findMany();

        const group = await prisma.recipeIngredientsGroup.create({
            data: {
                recipeId: recipe?.id || 1,
                ingredientsInGroup: {
                    createMany: {
                        data: [
                            { ingredientId: ingredient[0]?.id || 1 },
                            { ingredientId: ingredient[1]?.id || 1 }
                        ]
                    }
                }
            }
        });

        await agent
            .delete(`/groups/ingredient/${group?.id}`)
            .expect(StatusCodes.OK)


        const updatedgroup = await prisma.recipeIngredientsGroup.findUnique({ where: { id: group.id }, include: { ingredientsInGroup: true } });
        expect(updatedgroup?.ingredientsInGroup.length).toBe(0);
    })
})
