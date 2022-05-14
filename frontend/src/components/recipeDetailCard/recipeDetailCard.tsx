import React, { MouseEventHandler } from "react";
import "./recipeDetailCard.css";
import { XLg, StarFill, Icon } from "react-bootstrap-icons";
import { Button, Card, Badge } from "react-bootstrap";
import { Recipe } from "../../interfaces/Recipe";
import IngredientsList from "../ingredientsList/ingredientsList";

type Props = {
  recipe: Recipe,
}

const RecipeDetailCard = ({ recipe }: Props) => {
  return (
    <React.Fragment>
      <Card className="recipeDetailCard">
        <div className="recipe-image-container">
          <img className="recipe-image" src={`/api/files/${recipe.image?.id}`} alt="" />
        </div>
        <Card.Body className="suggestion-card-body">

          <Card.Title>
            {recipe.name}
            <span className="rating">
              {recipe.rating && recipe.rating > 0 ?
                <>{recipe.rating} <StarFill size={14} /></>
                : ''
              }
            </span>
          </Card.Title>
          <div className="ingredients">
            <IngredientsList ingredientsGroups={recipe.recipeIngredientsGroups} />
          </div>
          <div className="card-bottom">
            <div className="card-buttons">
            </div>
            <div className="card-price">
              {parseFloat(recipe.bonusPrice) < parseFloat(recipe.minPrice) &&
                <span className="full-price">€{recipe.minPrice}</span>
              }
              <span className="current-price">€{recipe.bonusPrice}</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    </React.Fragment >
  );
};

export default RecipeDetailCard;
