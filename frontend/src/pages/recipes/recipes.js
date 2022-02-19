import React, { useEffect, useState } from "react";
import "./recipes.css";
import axios from "axios";
import { Button, Container, Row, Card, Modal } from "react-bootstrap";
import RecipeCard from "../../components/recipeCard/recipeCard";
import { Plus, Pencil } from "react-bootstrap-icons";
import RecipeModal from "../../components/recipeModal/recipeModal";
import SearchBar from "../../components/searchBar/searchBar";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [removePopup, setRemovePopup] = useState({
    show: false,
    recipe_id: null,
  });
  const [editRecipe, setEditRecipe] = useState({
    id: null,
    name: "",
    description: "",
    rating: 0,
    groups: [],
  });
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    getRecipes();
  }, []);

  const getRecipes = () => {
    axios.get("/api/recipes").then((response) => {
      setRecipes(response.data);
    });
  };

  const searchRecipes = (query) => {
    axios.get(`/api/recipes/search?query=${query}`).then((response) => {
      setRecipes(response.data);
    });
  }

  const handleRemove = (recipe_id) => {
    setRemovePopup({
      show: true,
      recipe_id,
    });
  };

  const handleRemoveConfirm = () => {
    if (removePopup.show && removePopup.recipe_id) {
      axios.delete(`/api/recipes/${removePopup.recipe_id}`).then(() => {
        setRemovePopup({
          show: false,
          recipe_id: null,
        });
        getRecipes();
      });
    }
  };

  const handleRemoveCancel = () => {
    setRemovePopup({
      show: false,
      recipe_id: null,
    });
  };

  const openEditRecipeModal = (recipe, groups) => {
    setEditRecipe({
      id: recipe.id,
      name: recipe.name,
      description: recipe.description == null ? "" : recipe.description,
      rating: recipe.rating,
      groups: groups,
    });
    setEdit(true);
    setShowModal(true);
  };

  const getTotalPrice = () => {
    return recipes
      .map((recipe) => Number(recipe.min_price))
      .reduce((a, b) => a + b, 0)
      .toFixed(2);
  };

  const getAveragePrice = () => {
    return (getTotalPrice() / recipes.length).toFixed(2);
  };

  const getTotalBonus = () => {
    return recipes
      .map((recipe) => Number(recipe.min_price) - Number(recipe.bonus_price))
      .reduce((a, b) => a + b, 0)
      .toFixed(2);
  };

  const getAverageBonus = () => {
    return (getTotalBonus() / recipes.length).toFixed(2);
  };

  const recipeCards = recipes.map((val, index) => {
    return (
      <RecipeCard
        recipe={val}
        getRecipes={getRecipes}
        key={index}
        index={index}
        secondButtonIcon={Pencil}
        onRemove={handleRemove}
        onSecondButtonClick={openEditRecipeModal}
      />
    );
  });

  return (
    <div className="Recipes">
      <Container className="info" fluid>
        <Row>
          <Card className="info-item">
            <div className="card-body info-body">
              <span className="info-card-text">Average cost:</span>
              <span className="info-card-amount">€{getAveragePrice()}</span>
            </div>
          </Card>

          <Card className="info-item">
            <div className="card-body info-body">
              <span className="info-card-text">Average bonus:</span>
              <span className="info-card-amount">€{getAverageBonus()}</span>
            </div>
          </Card>

          <Card className="info-item">
            <div className="card-body info-body">
              <span className="info-card-text">Total bonus:</span>
              <span className="info-card-amount">€{getTotalBonus()}</span>
            </div>
          </Card>
          <Button className="info-item" onClick={() => setShowModal(true)}>
            <Plus size={24} />
            Add
          </Button>
          <SearchBar
            placeholderText={"Search recipe"}
            onSearch={(query) => searchRecipes(query)}
          />
        </Row>
      </Container>
      <Container>
        <Row>{recipeCards}</Row>
      </Container>
      <RecipeModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEdit(false);
        }}
        getRecipes={getRecipes}
        edit={edit}
        id={editRecipe.id}
        name={editRecipe.name}
        description={editRecipe.description}
        rating={editRecipe.rating}
        groups={editRecipe.groups}
      />
      <Modal show={removePopup.show}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Recipe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure that you want to delete this recipe?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleRemoveCancel}>
            cancel
          </Button>
          <Button variant="primary" onClick={handleRemoveConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Recipes;
