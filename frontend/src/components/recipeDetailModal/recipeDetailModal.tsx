import React, { useState } from "react";
import "./recipeDetailModal.css";
import { StarFill } from "react-bootstrap-icons";
import { Badge, Modal } from "react-bootstrap";
import { Recipe } from "../../interfaces/Recipe";
import IngredientsList from "../ingredientsList/ingredientsList";

type Props = {
  recipe: Recipe,
  show: boolean,
  handleClose: () => void;
}

const RecipeDetailModal = ({ recipe, show, handleClose }: Props) => {
  function isBonusRecipe(recipe: Recipe): boolean {
    return recipe.recipeIngredientsGroups
      .some(group => group.ingredientsInGroup
        .some(ingredient => ingredient.ingredient.isBonus)
      );
  }

  return (
    <React.Fragment>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton className="recipe-image-container">
          <div className="close-button-bg"></div>
          <img className="recipe-image-modal" src={`/api/files/${recipe.image?.id}`} alt="" />
        </Modal.Header>
        <Modal.Body className="suggestion-card-body">

          <span className="heading">
            {isBonusRecipe(recipe) && <Badge className="modal-bonus">BONUS</Badge>}
            {recipe.rating && recipe.rating > 0 ?
              <>{recipe.rating} <StarFill size={14} /></>
              : ''
            }
          </span>
          <span className="recipe-name">{recipe.name}</span>
          <span className="recipe-description" dangerouslySetInnerHTML={{ __html: recipe.description ? recipe.description : "" }}></span>
          <IngredientsList ingredientsGroups={recipe.recipeIngredientsGroups} />
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
        </Modal.Body>
      </Modal>
    </React.Fragment >
  );
};

export default RecipeDetailModal;
