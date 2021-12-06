import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import { Button, Container, Row } from 'react-bootstrap'
import RecipeCard from "./components/recipeCard/recipeCard";
import LoadButton from './components/loadButton/loadButton';

const App = () => {
  const [suggestedRecipes, setsuggestedRecipes] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [newRecipeName, setNewRecipeName] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {getRecipes()}, []);
  
  const getRecipes = () => {
    axios.get("/api/recipes")
      .then((response) => setRecipes(response.data));
  };

  const getSuggestions = () => {
    setLoadingSuggestions(true);
    axios.get("/api/suggest")
      .then((response) => {
        setsuggestedRecipes(response.data)
        setLoadingSuggestions(false);
      });
  }

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

  const suggestedRecipeCards = suggestedRecipes.map((val, key) => {
    return (
        <RecipeCard recipe={val} getRecipes={getRecipes} key={key} />
    )
  })

  const recipeCards = recipes.map((val, key) => {
    return (
        <RecipeCard recipe={val} getRecipes={getRecipes} key={key} />
    )
  })
  
  return (
    <div className='App'>
        <h1>Suggest Recipes</h1>
        <LoadButton className='my-2' variant="primary" onClick={getSuggestions} text="Suggest Weekly Recipes" loading={loadingSuggestions} loadText="Getting the best deals for you.."></LoadButton> <br /><br />
        <Container>
            <Row>
                {suggestedRecipeCards}
            </Row>
        </Container>
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

export default App;