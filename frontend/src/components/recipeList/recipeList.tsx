import React, { useState } from "react";
import "./recipeList.css";
import { Icon, PlusCircle } from "react-bootstrap-icons";
import { Card } from "react-bootstrap";
import { Recipe } from "../../interfaces/Recipe";
import RecipeCard from "../recipeCard/recipeCard";
import RecipeDetailModal from "../recipeDetailModal/recipeDetailModal";
import { motion } from "framer-motion";

type Props = {
  recipes: Recipe[]
  SecondButtonIcon: Icon,
  onRemove: (recipeId: number) => void,
  onSecondButtonClick: (recipe: Recipe) => void,
  onThirdButtonClick?: (recipe: Recipe) => void,
  onNewRecipeButtonClick?: () => void
}

const RecipeList = ({ recipes, SecondButtonIcon, onRemove, onSecondButtonClick, onThirdButtonClick, onNewRecipeButtonClick }: Props) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>();
  const [showModal, setShowModal] = useState<boolean>(false);

  const onClickRecipeCard = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  }

  const handleCloseModal = () => {
    setShowModal(false);
  }

  const newRecipeCard = () =>
    <div className="recipe-card-container">
      <motion.div
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.2 },
        }}
        style={{ display: 'flex' }}>
        <Card
          className="recipeCard"
          onClick={onNewRecipeButtonClick}
          style={{
            minHeight: '10rem',
            alignItems: 'center',
            backgroundColor: 'darkred',
            color: 'white',
            justifyContent: 'space-around'
          }}>
          <PlusCircle size={60} />
          <span style={{ fontSize: '20px', fontWeight: '500', position: 'absolute', bottom: '10%' }}>

            Nieuw Recept
          </span>
        </Card>
      </motion.div>
    </div >

  const recipeCards = recipes.map((recipe, index) =>
    <div className="recipe-card-container">
      <RecipeCard
        recipe={recipe}
        SecondButtonIcon={SecondButtonIcon}
        onRemove={() => onRemove(recipe.id)}
        onSecondButtonClick={onSecondButtonClick}
        onThirdButtonClick={onThirdButtonClick}
        key={index}
        onClick={() => onClickRecipeCard(recipe)}
      />
    </div>
  );

  if (onNewRecipeButtonClick) {
    recipeCards.splice(0, 0, newRecipeCard());
  }

  return (
    <>
      <div className="recipe-cards">
        {recipeCards}
      </div>
      {selectedRecipe && <RecipeDetailModal recipe={selectedRecipe} show={showModal} handleClose={handleCloseModal} />}
    </>
  );
};

export default RecipeList;
