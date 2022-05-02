import React from "react";
import "./recipeCard.css";
import { XLg } from "react-bootstrap-icons";
import { Button, Card } from "react-bootstrap";
import IngredientsList from "../ingredientsList/ingredientsList";
import ReactStars from "react-rating-stars-component";

const RecipeCard = (props) => {

  const minPrice = props.recipe.minPrice;
  const maxPrice = props.recipe.maxPrice;
  const bonusPrice = props.recipe.bonusPrice;

  return (
    <React.Fragment>
      <Card className="recipeCard">
        <Card.Body className="suggestion-card-body">
          <ReactStars
            value={props.recipe.rating}
            size={32}
            activeColor="#8c0269"
            edit={false}
          />
          <Card.Title>{props.recipe.name}</Card.Title>
          <div
            className="description"
            dangerouslySetInnerHTML={{ __html: props.recipe.description }}
          ></div>
          <div className="card-data">
            <IngredientsList groups={props.recipe.recipeIngredientsGroups} />
            <div className="card-bottom">
              <div className="card-buttons">
                <Button
                  className="card-button-delete"
                  onClick={() => props.onRemove(props.recipe.id)}
                >
                  <XLg size={20} />
                </Button>
                <Button
                  className="card-button-second"
                  onClick={() =>
                    props.onSecondButtonClick(props.recipe)
                  }
                >
                  <props.secondButtonIcon size={20} />
                </Button>
              </div>
              <div className="card-price">
                {minPrice > bonusPrice && maxPrice > minPrice && (
                  <span className="full-price">
                    €{minPrice} - €{maxPrice}
                  </span>
                )}
                {minPrice > bonusPrice && maxPrice <= minPrice && (
                  <span className="full-price">€{minPrice}</span>
                )}
                <span className="current-price">€{bonusPrice}</span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};

export default RecipeCard;
