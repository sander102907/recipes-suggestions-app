import { prismaMock } from '../../../../jest/clientMock'
import { RecipeController } from '../../recipe.controller'
import { RecipeService } from '../../recipe.service'
import { StatusCodes } from 'http-status-codes';
import { RecipeHelper } from '../../../../utils/recipeHelper';

const recipes = Array.from(new Array(5), (val, index) => {
    return {
        id: index,
        name: `test recipe ${index}`,
        description: `test description ${index}`,
        isSuggested: null,
        excludeFromSuggestions: null,
        suggestionEndDate: null,
        rating: Math.floor(Math.random() * 5) + 1, // Random number between 1 and 5
        recipeIngredientsGroups: []
    }
});

describe('get all recipes', () => {
    beforeEach(() => {
        prismaMock.recipe.findMany.mockResolvedValue(recipes);
    })

    it('should retrieve all recipes and send response correctly', async () => {
        // Arrange
        jest.spyOn(RecipeService, 'getAllRecipes');

        const mockReq = { query: {} } as any;
        const mockRes = { send: jest.fn() } as any;

        // Act
        await RecipeController.getRecipes(mockReq, mockRes);

        // Assert
        expect(RecipeService.getAllRecipes).toBeCalled();
        expect(mockRes.send).toBeCalledWith(recipes.map(RecipeHelper.computePrices));
    })

    it('should retrieve all bonus recipes and send response correctly', async () => {
        // Arrange
        jest.spyOn(RecipeService, 'getBonusRecipes');

        const mockReq = { query: { bonus: true } } as any;
        const mockRes = { send: jest.fn() } as any;

        // Act
        await RecipeController.getRecipes(mockReq, mockRes);

        // Assert
        expect(RecipeService.getBonusRecipes).toBeCalled();
        expect(mockRes.send).toBeCalledWith(recipes.map(RecipeHelper.computePrices));
    })

    it('should retrieve all non bonus recipes and send response correctly', async () => {
        // Arrange
        jest.spyOn(RecipeService, 'getNonBonusRecipes');

        const mockReq = { query: { bonus: false } } as any;
        const mockRes = { send: jest.fn() } as any;

        // Act
        await RecipeController.getRecipes(mockReq, mockRes);

        // Assert
        expect(RecipeService.getNonBonusRecipes).toBeCalled();
        expect(mockRes.send).toBeCalledWith(recipes.map(RecipeHelper.computePrices));
    })
})


describe('get recipe by ID', () => {
    beforeAll(() => {
        jest.spyOn(RecipeService, 'getRecipe');
    })

    it('should retrieve one recipe and send response correctly', async () => {
        // Arrange
        prismaMock.recipe.findUnique.mockResolvedValue(recipes[0]);

        const mockReq = { params: { id: '1' } } as any;
        const mockRes = { send: jest.fn() } as any;

        // Act
        await RecipeController.getRecipe(mockReq, mockRes);

        // Assert
        expect(RecipeService.getRecipe).toBeCalledWith(Number(mockReq.params.id));
        expect(mockRes.send).toBeCalledWith(RecipeHelper.computePrices(recipes[0]));
    })

    it('should send status NOT FOUND if no recipe with ID is found', async () => {
        // Arrange
        prismaMock.recipe.findUnique.mockResolvedValue(null);

        const mockReq = { params: { id: '1' } } as any;
        const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

        // Act
        await RecipeController.getRecipe(mockReq, mockRes);

        // Assert
        expect(RecipeService.getRecipe).toBeCalledWith(Number(mockReq.params.id));
        expect(mockRes.status).toBeCalledWith(StatusCodes.NOT_FOUND);
        expect(mockRes.send).toBeCalledWith({ errors: [{ msg: `No recipe with ID ${mockReq.params.id} exists in the database` }] });
    })
})

describe('Create recipe', () => {
    it('should create a recipe and send back the created recipe', async () => {
        // Arrange
        prismaMock.recipe.create.mockResolvedValue(recipes[0]);

        jest.spyOn(RecipeService, 'createRecipe');

        const mockReq = {
            body: {
                name: recipes[0].name,
                description: recipes[0].description,
                rating: recipes[0].rating
            }
        } as any;
        const mockRes = { send: jest.fn() } as any;

        // Act
        await RecipeController.createRecipe(mockReq, mockRes);

        // Assert
        expect(RecipeService.createRecipe).toBeCalledWith(mockReq.body.name, mockReq.body.description, mockReq.body.rating);
        expect(mockRes.send).toBeCalledWith(recipes[0]);
    })
})

describe('Update recipe', () => {
    it('should update a recipe and send back the updated recipe', async () => {
        // Arrange
        prismaMock.recipe.update.mockResolvedValue(recipes[0]);
        prismaMock.recipe.findUnique.mockResolvedValue(recipes[0]);

        jest.spyOn(RecipeService, 'updateRecipe');

        const mockReq = {
            params: { id: recipes[0].id },
            body: {
                name: recipes[0].name,
                description: recipes[0].description,
                rating: recipes[0].rating
            }
        } as any;
        const mockRes = { send: jest.fn() } as any;

        // Act
        await RecipeController.updateRecipe(mockReq, mockRes);

        // Assert
        expect(RecipeService.updateRecipe).toBeCalledWith(mockReq.params.id, mockReq.body.name, mockReq.body.description, mockReq.body.rating);
        expect(mockRes.send).toBeCalledWith(recipes[0]);
    })

    it('should send status NOT FOUND if no recipe with ID is found', async () => {
        // Arrange
        prismaMock.recipe.findUnique.mockResolvedValue(null);

        const mockReq = {
            params: { id: recipes[0].id },
            body: {
                name: recipes[0].name,
                description: recipes[0].description,
                rating: recipes[0].rating
            }
        } as any;
        const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

        // Act
        await RecipeController.updateRecipe(mockReq, mockRes);

        // Assert
        expect(RecipeService.getRecipe).toBeCalledWith(Number(mockReq.params.id));
        expect(mockRes.status).toBeCalledWith(StatusCodes.NOT_FOUND);
        expect(mockRes.send).toBeCalledWith({ errors: [{ msg: `No recipe with ID ${mockReq.params.id} exists in the database` }] });
    })
})

describe('Delete recipe', () => {
    it('should delete a recipe and send back nothing', async () => {
        // Arrange
        prismaMock.recipe.delete.mockResolvedValue(recipes[0]);
        prismaMock.recipe.findUnique.mockResolvedValue(recipes[0]);

        jest.spyOn(RecipeService, 'deleteRecipe');

        const mockReq = {
            params: { id: recipes[0].id },
        } as any;
        const mockRes = { send: jest.fn() } as any;

        // Act
        await RecipeController.deleteRecipe(mockReq, mockRes);

        // Assert
        expect(RecipeService.deleteRecipe).toBeCalledWith(mockReq.params.id);
        expect(mockRes.send).toBeCalledWith();
    })

    it('should send status NOT FOUND if no recipe with ID is found', async () => {
        // Arrange
        prismaMock.recipe.findUnique.mockResolvedValue(null);

        const mockReq = {
            params: { id: recipes[0].id },
        } as any;
        const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

        // Act
        await RecipeController.deleteRecipe(mockReq, mockRes);

        // Assert
        expect(RecipeService.getRecipe).toBeCalledWith(Number(mockReq.params.id));
        expect(mockRes.status).toBeCalledWith(StatusCodes.NOT_FOUND);
        expect(mockRes.send).toBeCalledWith({ errors: [{ msg: `No recipe with ID ${mockReq.params.id} exists in the database` }] });
    })
})

describe('Suggest recipes', () => {
    it('should suggest recipes and send response correctly', async () => {
        // Arrange
        prismaMock.recipe.findMany.mockResolvedValue(recipes);

        jest.spyOn(RecipeService, 'getBonusRecipes');
        jest.spyOn(RecipeService, 'getNonBonusRecipes');

        const mockReq = {} as any;
        const mockRes = { send: jest.fn() } as any;

        // Act
        await RecipeController.suggestRecipes(mockReq, mockRes);

        // Assert
        expect(RecipeService.getBonusRecipes).toBeCalled();
        expect(RecipeService.getNonBonusRecipes).toBeCalled();

        expect(mockRes.send).toBeCalledWith([
            ...recipes.map(RecipeHelper.computePrices),
            ...Array.from(new Array(7 - recipes.length), () => expect.anything())
        ]);
    })
})

describe('Search recipes', () => {
    it('should search recipes and send response correctly', async () => {
        // Arrange
        prismaMock.recipe.findMany.mockResolvedValue(recipes);

        jest.spyOn(RecipeService, 'searchRecipes');

        const mockReq = { query: { query: 'test query' } } as any;
        const mockRes = { send: jest.fn() } as any;

        // Act
        await RecipeController.searchRecipes(mockReq, mockRes);

        // Assert
        expect(RecipeService.searchRecipes).toBeCalledWith(mockReq.query.query);

        expect(mockRes.send).toBeCalledWith(recipes);
    })
})