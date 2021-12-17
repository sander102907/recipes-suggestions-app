import React, { useEffect, useState } from 'react';
import './recipes.css';
import axios from 'axios';
import { Button, Container, Row, Card } from 'react-bootstrap'
import RecipeCard from "../../components/recipeCard/recipeCard";
import { Plus } from 'react-bootstrap-icons';
import CreateRecipeModal from '../../components/createRecipeModal/createRecipeModal';


const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [newRecipeName, setNewRecipeName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {getRecipes()}, []);
  
  const getRecipes = () => {
    axios.get("/api/recipes")
      .then((response) => setRecipes(response.data));
  };

  const handleChange = (event) => {
    setNewRecipeName(event.target.value)
  };
 
  const addRecipe = () => {
    const newRecipe = {
      name: newRecipeName
    };

    axios.post('/api/recipe', newRecipe)
        .then(() => { 
          getRecipes();
      });
  };

  const recipeCards = recipes.map((val, key) => {
    return (
        <RecipeCard recipe={val} getRecipes={getRecipes} key={key} />
    )
  });
  
  return (
    <div className='Recipes'>
        <Container className='info' fluid>
          <Row>
              <Card className='info-item'>
                <div className='card-body info-body'>
                  <span className='info-card-text'>Average cost:</span>
                  <span className='info-card-amount'>€6.96</span> 
                </div>
              </Card>

              <Card className='info-item'>
                <div className='card-body info-body'>
                  <span className='info-card-text'>Average bonus:</span>
                  <span className='info-card-amount'>€1.21</span> 
                </div>
              </Card>
              <Button className='info-item' onClick={() => setShowCreateModal(true)}><Plus size={24} /> New</Button>
          </Row> 
        </Container>
        <div className='form'>
            <input name='newRecipeName' placeholder='Enter Recipe Name' onChange={handleChange} />
        </div>
        <Button className='my-2' variant="primary" onClick={addRecipe}>New Recipe</Button> <br /><br />
        <Container>
            <Row>
                {recipeCards}
            </Row>
        </Container>
        <CreateRecipeModal show={showCreateModal} onHide={() => setShowCreateModal(false)} getRecipes={getRecipes} />
    </div>
  );
}

export default Recipes;