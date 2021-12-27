import React, { useEffect, useState } from 'react';
import './recipes.css';
import axios from 'axios';
import { Button, Container, Row, Card, Modal } from 'react-bootstrap'
import RecipeCard from "../../components/recipeCard/recipeCard";
import { Plus, Pencil } from 'react-bootstrap-icons';
import RecipeModal from '../../components/recipeModal/recipeModal';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [prices, setPrices] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [removePopup, setRemovePopup] = useState({
    show: false,
    recipe_id: null,
  });
  const [editRecipe, setEditRecipe] = useState({
    id: null,
    name: '',
    description: '',
    rating: 0,
    groups: []
  });
  const [edit, setEdit] = useState(false);
  
  const addPrice = (price, index) => {
    setPrices(oldPrices => {
      const newPrices = [...oldPrices];
      newPrices[index] = Number(price);
      return newPrices;
    });
  }

  const addBonus = (bonus, index) => {
    setBonuses(oldBonuses => {
      const newBonuses = [...oldBonuses];
      newBonuses[index] = Number(bonus);
      return newBonuses;
    });
  }

  useEffect(() => {getRecipes()}, []);
  
  const getRecipes = () => {
    axios.get("/api/recipes")
      .then((response) => {
        setPrices(new Array(response.data.length).fill(0));
        setBonuses(new Array(response.data.length).fill(0));
        setRecipes([])
        setRecipes(response.data);
      });
  };

  const handleRemove = (recipe_id) => {
    setRemovePopup({
      show: true,
      recipe_id,
    });
  }

  const handleRemoveConfirm = () => {
    if (removePopup.show && removePopup.recipe_id) {
      axios.delete(`/api/recipes/${removePopup.recipe_id}`).then(() => {
        setRemovePopup({
          show: false,
          recipe_id: null,
        });
        getRecipes();
      })
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
      description: recipe.description == null ? '' : recipe.description,
      rating: recipe.rating,
      groups: groups
    });
    setEdit(true);
    setShowModal(true);
  }

  const getAveragePrice = () => {
    return (prices.reduce((a,b) => a + b, 0) / prices.length).toFixed(2);
  }

  const getAverageBonus = () => {
    return (bonuses.reduce((a,b) => a + b, 0) / bonuses.length).toFixed(2);
  }

  const getTotalBonus = () => {
    return bonuses.reduce((a,b) => a + b, 0).toFixed(2);
  }

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
          addPrice={addPrice}
          addBonus={addBonus}
        />
    )
  });
  
  return (
    <div className='Recipes'>
        <Container className='info' fluid>
          <Row>
              <Card className='info-item'>
                <div className='card-body info-body'>
                  <span className='info-card-text'>Average cost:</span>
                  <span className='info-card-amount'>€{getAveragePrice()}</span> 
                </div>
              </Card>

              <Card className='info-item'>
                <div className='card-body info-body'>
                  <span className='info-card-text'>Average bonus:</span>
                  <span className='info-card-amount'>€{getAverageBonus()}</span> 
                </div>
              </Card>

              <Card className='info-item'>
                <div className='card-body info-body'>
                  <span className='info-card-text'>Total bonus:</span>
                  <span className='info-card-amount'>€{getTotalBonus()}</span> 
                </div>
              </Card>
              <Button className='info-item' onClick={() => setShowModal(true)}><Plus size={24} /> Add</Button>
          </Row> 
        </Container>
        <Container>
            <Row>
                {recipeCards}
            </Row>
        </Container>
        <RecipeModal 
          show={showModal} 
          onHide={() => {setShowModal(false); setEdit(false);}} 
          getRecipes={getRecipes} 
          edit={edit} 
          id={editRecipe.id}
          name={editRecipe.name} 
          description={editRecipe.description} 
          rating={editRecipe.rating}
          groups={editRecipe.groups} />
        <Modal show={removePopup.show}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Recipe</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure that you want to delete this recipe?</Modal.Body>
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
}

export default Recipes;