import { Field, FieldArray, FieldArrayRenderProps, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Check2, Dash, Plus } from "react-bootstrap-icons";
import { Rating } from "react-simple-star-rating";
import * as yup from 'yup';
import ReactQuill from "react-quill";
import { Recipe } from "../../interfaces/Recipe";
import { Image } from "../../interfaces/Image";
import "./ingredientForm.css";
import axios from "axios";
import IngredientsSearchBar from "../ingredientSearchBar/ingredientSearchBar";
import IngredientListItem from "../ingredientListItem/ingredientListItem";
import IngredientComponent from "../ingredient/ingredient";
import { RecipeIngredientsGroup } from "../../interfaces/RecipeIngredientsGroup";
import { Ingredient } from "../../interfaces/Ingredient";


const schema = yup.object().shape({
});

type Props = {
    recipe: Recipe,
    onHide: () => void
}

interface RecipeIngredientDataData {
    recipeIngredientsGroups: RecipeIngredientsGroup[]
}

const IngredientForm = ({ recipe, onHide }: Props) => {
    const ingredientsSearchBar = useRef<HTMLInputElement>(null);
    const [alternativeGroup, setAlternativeGroup] = useState<number | null>(null);
    const [searchBarQuery, setSearchBarQuery] = useState<string | undefined>(undefined);

    const onSubmit = async (data: RecipeIngredientDataData) => {
        await axios.delete(`/api/groups/recipe/${recipe.id}`);
        data.recipeIngredientsGroups.forEach(async (ingredientGroup) => {
            if (ingredientGroup.ingredientsInGroup.length > 0) {
                await axios.post('/api/groups', {
                    recipeId: ingredientGroup.recipeId,
                    ingredientsInGroup: ingredientGroup.ingredientsInGroup.map(ingr => {
                        return {
                            ingredientId: ingr.ingredientId,
                            amount: ingr.amount
                        }
                    })
                });
            }
        });

        onHide();
    }

    const ingredientToShow = (group: RecipeIngredientsGroup) => {
        return group.ingredientsInGroup.reduce((prev, curr) => {
            if (prev.ingredient.isBonus && !curr.ingredient.isBonus) {
                return prev;
            }

            if (curr.ingredient.isBonus && !prev.ingredient.isBonus) {
                return curr;
            }

            if (curr.ingredient.bonusPrice && prev.ingredient.bonusPrice) {
                return curr.ingredient.bonusPrice < prev.ingredient.bonusPrice ? curr : prev;
            }

            return curr.ingredient.price < prev.ingredient.price ? curr : prev;
        });
    }

    const alternatives = (group: RecipeIngredientsGroup) => {
        return group.ingredientsInGroup.filter(ingr => ingr !== ingredientToShow(group));
    }

    return (
        <Formik
            validationSchema={schema}
            onSubmit={onSubmit}
            enableReintialize={true}
            initialValues={{
                recipeIngredientsGroups: recipe.recipeIngredientsGroups ? recipe.recipeIngredientsGroups : []
            }}
        >
            {({
                handleSubmit,
                handleChange,
                setFieldValue,
                isSubmitting,
                values,
                errors,
            }) => {
                const updateIngredientAmt = (arrayHelpers: FieldArrayRenderProps, index: number, amount: number) => {
                    const group = values.recipeIngredientsGroups[index];

                    if (amount > 99) {
                        amount = 99;
                    }

                    if (amount <= 0) {
                        arrayHelpers.replace(index, {
                            ...group,
                            ingredientsInGroup: [
                                ...group.ingredientsInGroup.filter(ingr => ingr !== ingredientToShow(group)),
                            ]
                        })

                        return;
                    }

                    arrayHelpers.replace(index, {
                        ...group,
                        ingredientsInGroup: [
                            ...group.ingredientsInGroup.filter(ingr => ingr !== ingredientToShow(group)),
                            {
                                ...group.ingredientsInGroup.find(ingr => ingr === ingredientToShow(group)),
                                amount: amount
                            }
                        ]
                    });
                }

                const addIngredient = async (ingredient: Ingredient) => {
                    const response = await axios.get<Ingredient>(`/api/ingredients/ah/${ingredient.ahId}`);

                    if (!response.data.id) {
                        return;
                    }

                    const ingredientObj = {
                        ingredientId: response.data.id,
                        ingredient: ingredient,
                        amount: 1
                    };

                    if (values.recipeIngredientsGroups.some(group => group.ingredientsInGroup.some(ingr => ingr.ingredientId === response.data.id))) {
                        return;
                    }

                    if (alternativeGroup != null) {
                        values.recipeIngredientsGroups[alternativeGroup].ingredientsInGroup.push(ingredientObj)
                        setAlternativeGroup(null);
                    } else {
                        const group = {
                            recipeId: recipe.id,
                            ingredientsInGroup: [
                                ingredientObj
                            ]
                        };

                        values.recipeIngredientsGroups.push(group);
                    }

                    setFieldValue('recipeIngredientsGroups', values.recipeIngredientsGroups);
                }

                const handleAddAlternativeButtonClick = (index: number) => {
                    if (!ingredientsSearchBar.current) {
                        return;
                    }

                    ingredientsSearchBar.current.focus();
                    setSearchBarQuery(ingredientToShow(values.recipeIngredientsGroups[index]).ingredient.name);
                    setAlternativeGroup(index);
                }

                return (<Form noValidate onSubmit={handleSubmit} className="ingredient-form">
                    {alternativeGroup !== null &&
                        <>
                            <span className="alternative-help-text">Alternatief voor {ingredientToShow(values.recipeIngredientsGroups[alternativeGroup]).ingredient.name} aan het toevoegen...</span>
                            <Button onClick={() => { setAlternativeGroup(null); setSearchBarQuery(""); }} className="add-alternative-cancel-button">Annuleren</Button>
                        </>
                    }
                    <IngredientsSearchBar
                        onClick={addIngredient}
                        refVar={ingredientsSearchBar}
                        query={searchBarQuery}
                    />

                    <FieldArray
                        name="recipeIngredientsGroups"
                        render={arrayHelpers => (
                            <div className="grid">
                                {values.recipeIngredientsGroups.map((group, index) => {
                                    return (group.ingredientsInGroup.length > 0 &&
                                        <div className="grid-item">
                                            <IngredientComponent
                                                key={index}
                                                ingredientInGroup={ingredientToShow(group)}
                                                alternativeIngredientInGroups={group.ingredientsInGroup.length > 1 ? alternatives(group) : undefined}
                                                showAmount={false}
                                                ButtonIcon={Plus}
                                                onButtonClick={() => handleAddAlternativeButtonClick(index)}
                                            />
                                            <div className="ingredient-amt-buttons">
                                                <Button
                                                    className="subtract-button"
                                                    onClick={() => updateIngredientAmt(arrayHelpers, index, ingredientToShow(group).amount - 1)}
                                                >
                                                    <Dash size={24} />
                                                </Button>
                                                <input
                                                    className="ingredient-amt"
                                                    type="number"
                                                    pattern="[0-9]{1,2}"
                                                    maxLength={2}
                                                    max={99}
                                                    value={ingredientToShow(group).amount}
                                                    onChange={(event) => updateIngredientAmt(arrayHelpers, index, parseInt(event.target.value))}
                                                ></input>
                                                <Button
                                                    className="add-button"
                                                    onClick={() => updateIngredientAmt(arrayHelpers, index, ingredientToShow(group).amount + 1)}
                                                >
                                                    <Plus size={24} />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}


                            </div>

                        )}
                    />
                    <Button type="submit" className="done-button" disabled={isSubmitting}><Check2 size={32} /></Button>
                </Form>
                )
            }
            }
        </Formik >
    );
}

export default IngredientForm;