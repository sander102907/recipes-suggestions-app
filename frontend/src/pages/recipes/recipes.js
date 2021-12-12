import React, { useEffect, useState } from 'react';
import './recipes.css';
import axios from 'axios';
import { Button, Container, Row } from 'react-bootstrap'
import RecipeCard from "../../components/recipeCard/recipeCard";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [newRecipeName, setNewRecipeName] = useState("");

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
        <h1>All recipes</h1>
        <div className='form'>
            <input name='newRecipeName' placeholder='Enter Recipe Name' onChange={handleChange} />
        </div>
        <Button className='my-2' variant="primary" onClick={addRecipe}>New Recipe</Button> <br /><br />
        <Container>
            <Row>
                {recipeCards}
            </Row>
        </Container>
    </div>
  );
}

export default Recipes;