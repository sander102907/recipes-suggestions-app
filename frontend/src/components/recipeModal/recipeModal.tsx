import React, { useEffect, useState, useRef } from "react";
import "./recipeModal.css";
import { Modal } from "react-bootstrap";
import "react-quill/dist/quill.snow.css";
import { Recipe } from "../../interfaces/Recipe";
import RecipeForm from "../recipeForm/recipeForm";
import IngredientForm from "../ingredientForm/ingredientForm";
import { motion } from "framer-motion";

type Props = {
  recipe?: Recipe,
  show: boolean,
  onHide: () => void
}

const RecipeModal = ({ recipe, show, onHide }: Props) => {
  const edit = recipe !== null;
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>(undefined);

  useEffect(() => {
    setSelectedRecipe(recipe);
  }, [recipe]);

  const [ingredientFormOpen, setIngredientFormOpen] = useState(false);

  const motionVariants = {
    initialRecipe: { opacity: 1 },
    initialIngredients: { opacity: 0 },
    open: {
      opacity: ingredientFormOpen && selectedRecipe ? 1 : 0,
      x: ingredientFormOpen && selectedRecipe ? 0 : 300,
      y: 0
    },
    close: {
      opacity: ingredientFormOpen && selectedRecipe ? 0 : 1,
      x: ingredientFormOpen && selectedRecipe ? -300 : 0,
      y: 0
    }
  }

  const close = () => {
    setIngredientFormOpen(false);
    setSelectedRecipe(undefined);
    onHide();
  }


  return (
    <Modal show={show} className="recipe-modal" onHide={close} >
      <Modal.Header closeButton>
        <Modal.Title style={{ padding: '10px 16px' }}>
          {edit ? "Recept aanpassen" : "Nieuw recept"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ paddingTop: '0px', display: "grid", gridTemplateColumns: "1fr", minHeight: "400px" }}>
        <motion.div variants={motionVariants}
          initial="initialRecipe"
          animate="close"
          transition={{ type: 'linear' }}
          className="recipe-modal-form"
          style={{ display: ingredientFormOpen ? "none" : "block" }}
        >
          <RecipeForm recipe={recipe} setRecipe={setSelectedRecipe} onNextPage={() => setIngredientFormOpen(true)} />
        </motion.div>

        <motion.div variants={motionVariants}
          initial="initialIngredients"
          animate="open"
          transition={{ type: 'linear' }}
          className="recipe-modal-form"
          style={{ display: ingredientFormOpen ? "block" : "none" }}
        >
          {selectedRecipe && <IngredientForm recipe={selectedRecipe} onHide={close} />}
        </motion.div>
      </Modal.Body>
    </Modal>
  );
};

export default RecipeModal;
