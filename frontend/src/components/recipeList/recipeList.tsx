import React, { useState, useEffect } from "react";
import axios from "axios";
import "./recipeList.css";
import { Icon } from "react-bootstrap-icons";
import { Container, Row, Col } from "react-bootstrap";
import { Recipe } from "../../interfaces/Recipe";
import RecipeCard from "../recipeCard/recipeCard";
import RecipeDetailModal from "../recipeDetailModal/recipeDetailModal";

type Props = {
  getRecipesUrl: string
  SecondButtonIcon: Icon,
  onRemove: (recipeId: number) => void,
  onSecondButtonClick: (recipe: Recipe) => void
}

const RecipeList = ({ getRecipesUrl, SecondButtonIcon, onRemove, onSecondButtonClick }: Props) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [expandedIndex, setExpandedIndex] = useState<number>();

  useEffect(() => {
    getRecipes();
  }, []);

  const getRecipes = () => {
    axios.get(getRecipesUrl).then((response) => {
      setRecipes(response.data);
    });
  };

  const onClickRecipeCard = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  }

  const handleCloseModal = () => {
    setShowModal(false);
  }

  const recipeCards = recipes.map((recipe, index) =>
    <div className={`${index == expandedIndex && 'expanded'} column`}>
      <RecipeCard
        recipe={recipe}
        SecondButtonIcon={SecondButtonIcon}
        onRemove={onRemove}
        onSecondButtonClick={onSecondButtonClick}
        key={index}
        onClick={() => onClickRecipeCard(recipe)}
      />
    </div>
  );

  return (
    <Container className="recipe-cards" fluid>
      <Row>{recipeCards}</Row>
      <Row>{selectedRecipe && <RecipeDetailModal recipe={selectedRecipe} show={showModal} handleClose={handleCloseModal} />}</Row>
    </Container>
  );
};

export default RecipeList;
