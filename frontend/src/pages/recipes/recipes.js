import React, { useEffect, useState } from "react";
import "./recipes.css";
import axios from "axios";
import { Button, Modal } from "react-bootstrap";
import { Pencil } from "react-bootstrap-icons";
import RecipeModal from "../../components/recipeModal/recipeModal";
import SearchBar from "../../components/searchBar/searchBar";
import RecipeList from "../../components/recipeList/recipeList";


const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [removePopup, setRemovePopup] = useState({
    show: false,
    recipe_id: null,
  });
  const [editRecipe, setEditRecipe] = useState(null);

  const [recipesUrl, setRecipesUrl] = useState("/api/recipes");

  const searchRecipes = (query) => {
    if (query.length < 2) {
      setRecipesUrl(`/api/recipes`);
    } else {
      setRecipesUrl(`/api/recipes/search?query=${query}`);
    }
  }

  useEffect(() => {
    getRecipes();
  }, [recipesUrl]);

  const getRecipes = () => {
    axios.get(recipesUrl).then((response) => {
      setRecipes(response.data);
    });
  };

  const handleRemove = (recipe_id) => {
    setRemovePopup({
      show: true,
      recipe_id,
    });
  };

  const handleRemoveConfirm = async () => {
    if (removePopup.show && removePopup.recipe_id) {
      await axios.delete(`/api/recipes/${removePopup.recipe_id}`);
      setRemovePopup({
        show: false,
        recipe_id: null,
      });

      getRecipes();
    }
  };

  const handleRemoveCancel = () => {
    setRemovePopup({
      show: false,
      recipe_id: null,
    });
  };

  const openNewRecipeModal = () => {
    setEditRecipe(null);
    setShowModal(true);
  }

  const openEditRecipeModal = (recipe) => {
    setEditRecipe(recipe);
    setShowModal(true);
  };

  const getTotalPrice = () => {
    return recipes
      .map((recipe) => Number(recipe.minPrice))
      .reduce((a, b) => a + b, 0)
      .toFixed(2);
  };

  const getAveragePrice = () => {
    return (getTotalPrice() / recipes.length).toFixed(2);
  };

  const getTotalBonus = () => {
    return recipes
      .map((recipe) => Number(recipe.minPrice) - Number(recipe.bonusPrice))
      .reduce((a, b) => a + b, 0)
      .toFixed(2);
  };

  const getAverageBonus = () => {
    return (getTotalBonus() / recipes.length).toFixed(2);
  };

  return (
    <div className="Recipes">
      <SearchBar
        placeholderText={"Zoeken naar recepten.."}
        onSearch={(query) => searchRecipes(query)}
      />
      <RecipeList
        recipes={recipes}
        SecondButtonIcon={Pencil}
        onRemove={handleRemove}
        onSecondButtonClick={openEditRecipeModal}
        onNewRecipeButtonClick={openNewRecipeModal}
      />
      <RecipeModal
        recipe={editRecipe}
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditRecipe(null);
          getRecipes();
        }}
      />
      <Modal show={removePopup.show}>
        <Modal.Header closeButton>
          <Modal.Title style={{ padding: "12px" }}>Delete Recipe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure that you want to delete this recipe?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="" style={{ border: '0' }} onClick={handleRemoveCancel}>
            cancel
          </Button>
          <Button variant="" style={{ backgroundColor: 'darkred', border: '0' }} onClick={handleRemoveConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Recipes;
