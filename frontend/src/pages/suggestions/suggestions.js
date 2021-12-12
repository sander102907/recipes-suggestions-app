import React, { useEffect, useState } from 'react';
import './suggestions.css';
import axios from 'axios';
import { Container, Row } from 'react-bootstrap'
import RecipeCard from "../../components/recipeCard/recipeCard";

const Suggestions = () => {
  const [suggestedRecipes, setsuggestedRecipes] = useState([]);

  useEffect(() => {getSuggestions()}, []);

  const getSuggestions = () => {
    axios.get("/api/suggest")
      .then((response) => {
        setsuggestedRecipes(response.data)
      });
  }

  const suggestedRecipeCards = suggestedRecipes.map((val, key) => {
    return (
        <RecipeCard recipe={val} key={key} />
    )
  });
  
  return (
    <div className='Suggestions'>
        <h1>Suggested Recipes</h1>
        <Container>
            <Row>
                {suggestedRecipeCards}
            </Row>
        </Container>
    </div>
  );
}

export default Suggestions;