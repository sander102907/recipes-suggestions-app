import { Field, FieldArray, FieldArrayRenderProps, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
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
import IngredientHelper from "../../helpers/ingredientHelper";


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
    const [loading, setLoading] = useState<boolean>(false);

    const onSubmit = async (data: RecipeIngredientDataData) => {
        setLoading(true);
        await axios.delete(`/api/groups/recipe/${recipe.id}`);
        for (const ingredientGroup of data.recipeIngredientsGroups) {
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
        };

        setLoading(false);

        onHide();
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
                                ...group.ingredientsInGroup.filter(ingr => ingr !== IngredientHelper.ingredientToShow(group)),
                            ]
                        })

                        return;
                    }

                    arrayHelpers.replace(index, {
                        ...group,
                        ingredientsInGroup: [
                            ...group.ingredientsInGroup.filter(ingr => ingr !== IngredientHelper.ingredientToShow(group)),
                            {
                                ...group.ingredientsInGroup.find(ingr => ingr === IngredientHelper.ingredientToShow(group)),
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
                    setSearchBarQuery(IngredientHelper.ingredientToShow(values.recipeIngredientsGroups[index]).ingredient.name);
                    setAlternativeGroup(index);
                }

                return (<Form noValidate onSubmit={handleSubmit} className="ingredient-form">
                    {alternativeGroup !== null &&
                        <>
                            <span className="alternative-help-text">Alternatief voor {IngredientHelper.ingredientToShow(values.recipeIngredientsGroups[alternativeGroup]).ingredient.name} aan het toevoegen </span>
                            <Button variant="" onClick={() => { setAlternativeGroup(null); setSearchBarQuery(""); }} className="add-alternative-cancel-button">Annuleren</Button>
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
                                                ingredientInGroup={IngredientHelper.ingredientToShow(group)}
                                                alternativeIngredientInGroups={group.ingredientsInGroup.length > 1 ? IngredientHelper.alternatives(group) : undefined}
                                                showAmount={false}
                                                ButtonIcon={Plus}
                                                onButtonClick={() => handleAddAlternativeButtonClick(index)}
                                            />
                                            <div className="ingredient-amt-buttons">
                                                <Button
                                                    variant=""
                                                    className="subtract-button"
                                                    onClick={() => updateIngredientAmt(arrayHelpers, index, IngredientHelper.ingredientToShow(group).amount - 1)}
                                                >
                                                    <Dash size={24} />
                                                </Button>
                                                <input
                                                    className="ingredient-amt"
                                                    type="number"
                                                    pattern="[0-9]{1,2}"
                                                    maxLength={2}
                                                    max={99}
                                                    value={IngredientHelper.ingredientToShow(group).amount}
                                                    onChange={(event) => updateIngredientAmt(arrayHelpers, index, parseInt(event.target.value))}
                                                ></input>
                                                <Button
                                                    variant=""
                                                    className="add-button"
                                                    onClick={() => updateIngredientAmt(arrayHelpers, index, IngredientHelper.ingredientToShow(group).amount + 1)}
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
                    <Button variant="" type="submit" className="done-button secondary" disabled={isSubmitting}>
                        {loading ?
                            <Spinner animation="border" size="sm" className="done-button-spinner" /> :
                            <Check2 size={32} />}
                    </Button>
                </Form>
                )
            }
            }
        </Formik >
    );
}

export default IngredientForm;