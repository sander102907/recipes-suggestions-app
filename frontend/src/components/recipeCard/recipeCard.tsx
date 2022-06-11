import React from "react";
import "./recipeCard.css";
import { XLg, StarFill, Icon, HeartFill, Heart } from "react-bootstrap-icons";
import { Button, Card, Badge } from "react-bootstrap";
import { Recipe } from "../../interfaces/Recipe";
import { motion } from "framer-motion";

type Props = {
  recipe: Recipe,
  SecondButtonIcon: Icon,
  onRemove: (recipeId: number) => void,
  onSecondButtonClick: (recipe: Recipe) => void
  onThirdButtonClick?: (recipe: Recipe) => void
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

const RecipeCard = ({ recipe, SecondButtonIcon, onRemove, onSecondButtonClick, onThirdButtonClick, onClick }: Props) => {
  function handleRemove(event: React.SyntheticEvent, recipeId: number) {
    event.stopPropagation();
    onRemove(recipeId);
  }

  function handleSecondButtonClick(event: React.SyntheticEvent, recipe: Recipe) {
    event.stopPropagation();
    onSecondButtonClick(recipe);
  }

  function handleThirdButtonClick(event: React.SyntheticEvent, recipe: Recipe) {
    event.stopPropagation();
    if (onThirdButtonClick != undefined) {
      onThirdButtonClick(recipe);
    }
  }

  return (
    <React.Fragment>
      <motion.div
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.2 },
        }}
        style={{ display: 'flex' }}>
        <Card className="recipeCard" onClick={() => { onClick(recipe) }}>
          <div className="recipe-image-container">
            <img className="recipe-image" src={`/api/files/${recipe.image?.id}`} alt="" />
            {isBonusRecipe(recipe) && <Badge className="bonus">BONUS</Badge>}
          </div>
          <Card.Body className="suggestion-card-body">
            <div className="card-top">
              <Card.Title>
                <span>{recipe.name}</span>
                <span className="rating">
                  {recipe.rating && recipe.rating > 0 ?
                    <>{recipe.rating} <StarFill size={14} /></>
                    : ''
                  }
                </span>
              </Card.Title>
              <div className="ingredients">
                {getIngredientsText(recipe)}
              </div>
            </div>
            <div className="card-bottom">
              <div className="card-buttons">
                <Button
                  variant=""
                  className="card-button"
                  onClick={(event) => handleRemove(event, recipe.id)}
                >
                  <XLg size={14} />
                </Button>
                <Button
                  variant=""
                  className="card-button"
                  onClick={(event) =>
                    handleSecondButtonClick(event, recipe)
                  }
                >
                  <SecondButtonIcon size={14} />
                </Button>
                {onThirdButtonClick && <Button
                  variant=""
                  className="card-button"
                  onClick={(event) =>
                    handleThirdButtonClick(event, recipe)
                  }
                >
                  {recipe.isSuggested ? <HeartFill size={14} /> : <Heart size={14} />}
                </Button>}
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
      </motion.div>
    </React.Fragment >
  );
};

export default RecipeCard;
