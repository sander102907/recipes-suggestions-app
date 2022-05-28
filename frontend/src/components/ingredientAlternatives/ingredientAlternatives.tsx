import React from "react";
import "./ingredientAlternatives.css";
import { IngredientsInGroup } from "../../interfaces/IngredientsInGroup";
import Ingredient from "../ingredient/ingredient";

type Props = {
  ingredientInGroups: IngredientsInGroup[],
  showAmount?: boolean,
}

const IngredientAlternatives = ({ ingredientInGroups, showAmount = true }: Props) => {
  return (
    <div className={"alternatives-container"}>
      <h5>Alternatief</h5>
      <div className={"alternatives-list"}>
        {ingredientInGroups.map((ingr, index) => {
          return (
            <>
              <Ingredient ingredientInGroup={ingr} showAmount={showAmount} />
              {index < ingredientInGroups.length - 1 && <hr />}
            </>
          )
        })}
      </div>
    </div>
  );
};

export default IngredientAlternatives;
