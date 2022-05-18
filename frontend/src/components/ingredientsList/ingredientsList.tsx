import React from "react";
import "./ingredientsList.css";
import { RecipeIngredientsGroup } from "../../interfaces/RecipeIngredientsGroup";
import Ingredient from "../ingredient/ingredient";

type Props = {
  ingredientsGroups: RecipeIngredientsGroup[]
}

const IngredientsList = ({ ingredientsGroups }: Props) => {
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
    <div className="ingredients">
      <h5 className="ingredients-title">Ingrediënten</h5>
      {ingredientsGroups.length === 0 ? "Geen ingrediënten.." :
        <div className="ingredient-list">
          {ingredientsGroups.map((group, index) => {
            return (group.ingredientsInGroup.length > 0 &&
              <Ingredient
                key={index}
                ingredientInGroup={ingredientToShow(group)}
                alternativeIngredientInGroups={group.ingredientsInGroup.length > 1 ? alternatives(group) : undefined} />
            );
          })}
        </div>
      }
    </div>
  );
};

export default IngredientsList;
