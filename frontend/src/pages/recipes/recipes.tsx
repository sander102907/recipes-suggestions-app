import React, { useEffect, useState } from "react";
import "./recipes.css";
import axios from "axios";
import { Button, Modal, Toast, ToastContainer } from "react-bootstrap";
import { Pencil } from "react-bootstrap-icons";
import RecipeModal from "../../components/recipeModal/recipeModal";
import RecipeList from "../../components/recipeList/recipeList";
import { Recipe } from "../../interfaces/Recipe";
import SearchBar from "../../components/searchBar/searchBar";


const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastRecipe, setToastRecipe] = useState<Recipe | undefined>(undefined);
  const [removePopup, setRemovePopup] = useState<{ show: boolean, recipeId: number | null }>({
    show: false,
    recipeId: null,
  });
  const [editRecipe, setEditRecipe] = useState<Recipe | undefined>(undefined);

  const [recipesUrl, setRecipesUrl] = useState("/api/recipes");

  const searchRecipes = (query: string) => {
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

  const handleRemove = (recipeId: number) => {
    setRemovePopup({
      show: true,
      recipeId,
    });
  };

  const handleRemoveConfirm = async () => {
    if (removePopup.show && removePopup.recipeId) {
      await axios.delete(`/api/recipes/${removePopup.recipeId}`);
      setRemovePopup({
        show: false,
        recipeId: null,
      });

      getRecipes();
    }
  };

  const handleRemoveCancel = () => {
    setRemovePopup({
      show: false,
      recipeId: null,
    });
  };

  const openNewRecipeModal = () => {
    setEditRecipe(undefined);
    setShowModal(true);
  }

  const openEditRecipeModal = (recipe: Recipe) => {
    setEditRecipe(recipe);
    setShowModal(true);
  };

  const toggleIsSuggested = async (recipe: Recipe) => {
    await axios.patch(`/api/recipes/${recipe.id}`, {
      isSuggested: !recipe.isSuggested
    });

    setToastRecipe(recipe);
    setShowToast(true);
    getRecipes();
  }

  return (
    <>
      <ToastContainer className="p-3" position={'top-end'}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={2500} autohide>
          <Toast.Header closeButton={false}>
            <strong className="me-auto">Notificatie</strong>
            <small className="text-muted">Nu</small>
          </Toast.Header>
          <Toast.Body>{toastRecipe?.name} {!toastRecipe?.isSuggested ? 'toegevoegd aan' : 'verwijderd van'} je weekmenu! &#127860;</Toast.Body>
        </Toast>
      </ToastContainer>
      <div className="Recipes">
        <SearchBar
          placeholderText={"Zoeken naar recepten.."}
          onSearch={searchRecipes}
        />
        <RecipeList
          recipes={recipes}
          SecondButtonIcon={Pencil}
          onRemove={handleRemove}
          onSecondButtonClick={openEditRecipeModal}
          onThirdButtonClick={toggleIsSuggested}
          onNewRecipeButtonClick={openNewRecipeModal}
        />
        <RecipeModal
          recipe={editRecipe}
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setEditRecipe(undefined);
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
    </>
  );
};

export default Recipes;
