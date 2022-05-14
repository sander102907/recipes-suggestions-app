import React from "react";
import "./ingredientsList.css";
import { RecipeIngredientsGroup } from "../../interfaces/RecipeIngredientsGroup";
import Ingredient from "../ingredient/ingredient";

type Props = {
  ingredientsGroups: RecipeIngredientsGroup[]
}

const IngredientsList = ({ ingredientsGroups }: Props) => {
  return (
    <div className="ingredients">
      <h5 className="ingredients-title">Ingrediënten</h5>
      {ingredientsGroups.length === 0 ? "No ingredients yet, try adding some" : ""}
      <div className="ingredient-list">
        {ingredientsGroups.map(group => {
          return (
            <Ingredient ingredientGroup={group.ingredientsInGroup} />
          );
        })}
      </div>
    </div>
  );
};

export default IngredientsList;
