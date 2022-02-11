import React from "react";
import { Badge } from "react-bootstrap";
import "./ingredientsList.css";
import { XLg, ArrowDownUp } from "react-bootstrap-icons";

const IngredientsList = (props) => {
  const maxHeight = props.maxHeight;
  return (
    <div className="ingredients" style={{ maxHeight: maxHeight }}>
      <h5 className="ingredients-title">Ingredients</h5>
      {props.groups.length === 0 ? "No ingredients yet, try adding some" : ""}
      {props.groups.map((group, group_index) => {
        return (
          group.ingredients.length > 0 && (
            <div className="ingredient-group" key={group_index}>
              {group.ingredients.map((ingredient, ingredient_index) => {
                return (
                  <div
                    className="ingredient-item-container"
                    key={ingredient_index}
                  >
                    <div className="ingredient-item">
                      <div className="ingredient-item-image">
                        <img src={ingredient.image_small} alt="" />
                      </div>
                      <div className="ingredient-item-info-container">
                        <div className="ingredient-item-info">
                          <div className="ingredient-item-info-left">
                            <div>
                              {ingredient.name}{" "}
                              {ingredient.is_bonus ? (
                                <Badge
                                  className="ingredient-bonus-badge"
                                  bg="info"
                                >
                                  {ingredient.bonus_mechanism}
                                </Badge>
                              ) : null}
                            </div>
                            <div className="ingredient-unit-size">
                              {ingredient.unit_size}
                            </div>
                          </div>
                          <div className="ingredient-item-info-right">
                            <div className="ingredient-item-info-right-buttons">
                              {props.onOr != null ? (
                                <div
                                  className="ingredient-item-or"
                                  onClick={() => props.onOr(group_index)}
                                >
                                  <Badge bg="info">OR</Badge>
                                </div>
                              ) : null}
                              {props.onRemove != null ? (
                                <div
                                  className="ingredient-item-close"
                                  onClick={() =>
                                    props.onRemove(
                                      group_index,
                                      ingredient_index
                                    )
                                  }
                                >
                                  <XLg />
                                </div>
                              ) : null}
                            </div>
                            <div className="ingredient-price">
                              €
                              {ingredient.bonus_price != null
                                ? ingredient.bonus_price
                                : ingredient.price}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {ingredient_index < group.ingredients.length - 1 && (
                      <div className="ingredient-or-divider">
                        <ArrowDownUp size={18} />
                        OR
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        );
      })}
    </div>
  );
};

export default IngredientsList;
