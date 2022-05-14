import React from "react";
import { Badge } from "react-bootstrap";
import "./ingredient.css";
import { IngredientsInGroup } from "../../interfaces/IngredientsInGroup";

type Props = {
  ingredientGroup: IngredientsInGroup[]
}

const Ingredient = ({ ingredientGroup }: Props) => {
  const ingredientObj = ingredientGroup[0];
  const ingredient = ingredientObj.ingredient;

  return (
    <div className="ingredient-item">
      <div className="image-container">
        <img src={ingredient.image} className="image" />
        {ingredient.isBonus && (
          <Badge
            className="bonus-badge"
          >
            {ingredient.bonusMechanism}
          </Badge>
        )}
        <Badge
          className="amount-badge"
        >
          {ingredientObj.amount}
        </Badge>
      </div>
      <div className="info-container">
        <div className="info">
          <div>
            {ingredient.name}
          </div>
          <span className="price-integer">
            €{Math.floor(ingredient.price)}.
          </span>
          <span className="price-decimal">
            {(ingredient.price % 1).toFixed(2).substring(2)}
          </span>
          <span className="unit-size">
            {" "}{ingredient.unitSize}
          </span>

        </div>
      </div>
    </div>
  );
};

export default Ingredient;
