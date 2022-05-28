import React, { useEffect, useRef, useState } from "react";
import "./ingredientsList.css";
import { RecipeIngredientsGroup } from "../../interfaces/RecipeIngredientsGroup";
import Ingredient from "../ingredient/ingredient";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

type Props = {
  ingredientsGroups: RecipeIngredientsGroup[]
}

const IngredientsList = ({ ingredientsGroups }: Props) => {
  const ingredientList = useRef<HTMLDivElement>(null);
  const [overflowActive, setOverflowActive] = useState(false);

  useEffect(() => {
    if (checkOverflow()) {
      setOverflowActive(true);
      return;
    }
    setOverflowActive(false);
  }, [overflowActive]);

  const scroll = async (scrollOffset: number) => {
    if (ingredientList.current) {
      for (let i = 0; i < Math.abs(Math.ceil(scrollOffset / 10)); i++) {
        ingredientList.current.scrollLeft += scrollOffset > 0 ? 20 : -20;
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
  }

  const checkOverflow = (): boolean => {
    if (ingredientList.current) {
      return (
        ingredientList.current.offsetWidth < ingredientList.current.scrollWidth
      );
    }
    return false;
  };

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
      <div className="ingredient-list-container">
        {overflowActive && <div className="ingredient-list-arrow-button" onClick={() => scroll(-400)}><ChevronLeft size={24} /></div>}
        {ingredientsGroups.length === 0 ? "Geen ingrediënten.." :
          <div className="ingredient-list" ref={ingredientList}>
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
        {overflowActive && <div className="ingredient-list-arrow-button" onClick={() => scroll(400)}><ChevronRight size={24} /></div>}
      </div>
    </div>
  );
};

export default IngredientsList;
