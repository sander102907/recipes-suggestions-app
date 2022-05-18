import React, { MouseEventHandler } from "react";
import "./recipeCard.css";
import { XLg, StarFill, Icon } from "react-bootstrap-icons";
import { Button, Card, Badge } from "react-bootstrap";
import { Recipe } from "../../interfaces/Recipe";

type Props = {
  recipe: Recipe,
  SecondButtonIcon: Icon,
  onRemove: (recipeId: number) => void,
  onSecondButtonClick: (recipe: Recipe) => void
  onClick: (recipe: Recipe) => void
}

const truncate = (input: string, length: number) => input.length > length ? `${input.substring(0, length - 3)}...` : input;

function getIngredientsText(recipe: Recipe): string {
  if (recipe.recipeIngredientsGroups.length > 0) {
    const text = 'Met ' + recipe.recipeIngredientsGroups
      .map(group => group.ingredientsInGroup.length > 0 ? group.ingredientsInGroup[0].ingredient.name : '')
      .reduce((ingr1, ingr2) => ingr1 + `, ${ingr2}`);
    return truncate(text, 140);
  }

  return 'Bevat (nog) geen ingrediënten.'
}

function isBonusRecipe(recipe: Recipe): boolean {
  return recipe.recipeIngredientsGroups
    .some(group => group.ingredientsInGroup
      .some(ingredient => ingredient.ingredient.isBonus)
    );
}

const RecipeCard = ({ recipe, SecondButtonIcon, onRemove, onSecondButtonClick, onClick }: Props) => {
  return (
    <React.Fragment>
      <Card className="recipeCard" onClick={() => { onClick(recipe) }}>
        <div className="recipe-image-container">
          <img className="recipe-image" src={`/api/files/${recipe.image?.id}`} alt="" />
          {isBonusRecipe(recipe) && <Badge className="bonus">BONUS</Badge>}
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
            Met {getIngredientsText(recipe)}
          </div>
          <div className="card-bottom">
            <div className="card-buttons">
              <Button
                className="card-button"
                onClick={() => onRemove(recipe.id)}
              >
                <XLg size={14} />
              </Button>
              <Button
                className="card-button"
                onClick={() =>
                  onSecondButtonClick(recipe)
                }
              >
                <SecondButtonIcon size={14} />
              </Button>
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

export default RecipeCard;
