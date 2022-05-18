import React from "react";
import "./ingredientAlternatives.css";
import { IngredientsInGroup } from "../../interfaces/IngredientsInGroup";
import Ingredient from "../ingredient/ingredient";

type Props = {
  ingredientInGroups: IngredientsInGroup[],
}

const IngredientAlternatives = ({ ingredientInGroups }: Props) => {
  return (
    <div className={"container"}>
      <h5>Alternatief</h5>
      {ingredientInGroups.map((ingr, index) => {
        return (
          <>
            <Ingredient ingredientInGroup={ingr} />
            {index < ingredientInGroups.length - 1 && <hr />}
          </>
        )
      })}
    </div>
  );
};

export default IngredientAlternatives;
