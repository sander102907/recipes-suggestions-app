import React, { useState, useEffect } from "react";
import axios from "axios";
import "./recipeList.css";
import { Icon } from "react-bootstrap-icons";
import { Container, Row, Col } from "react-bootstrap";
import { Recipe } from "../../interfaces/Recipe";
import RecipeCard from "../recipeCard/recipeCard";
import RecipeDetailCard from "../recipeDetailCard/recipeDetailCard";

type Props = {
  getRecipesUrl: string
  SecondButtonIcon: Icon,
  onRemove: (recipeId: number) => void,
  onSecondButtonClick: (recipe: Recipe) => void
}

const RecipeList = ({ getRecipesUrl, SecondButtonIcon, onRemove, onSecondButtonClick }: Props) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>();

  useEffect(() => {
    getRecipes();
  }, []);

  const getRecipes = () => {
    axios.get(getRecipesUrl).then((response) => {
      setRecipes(response.data);
    });
  };

  const recipeCards = recipes.map((recipe, index) =>
    <div className="column">
      <RecipeCard
        recipe={recipe}
        SecondButtonIcon={SecondButtonIcon}
        onRemove={onRemove}
        onSecondButtonClick={onSecondButtonClick}
        key={index}
        onClick={(recipe) => setSelectedRecipe(recipe)}
      />
    </div>
  );

  return (
    <Container className="recipe-cards" fluid>
      <Row>{recipeCards}</Row>
      <Row>{selectedRecipe && <RecipeDetailCard recipe={selectedRecipe} />}</Row>
    </Container>
  );
};

export default RecipeList;
