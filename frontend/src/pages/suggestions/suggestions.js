import React, { useEffect, useState } from 'react';
import './suggestions.css';
import axios from 'axios';
import { Container, Row, Card, Button } from 'react-bootstrap'
import { Shuffle, Share } from 'react-bootstrap-icons';
import RecipeCard from '../../components/recipeCard/recipeCard';
import { WhatsappShareButton, WhatsappIcon } from "react-share";

const Suggestions = () => {
  const [suggestedRecipes, setsuggestedRecipes] = useState([]);
  const [shareText, setShareText] = useState('');

  const getTotalCost = () => {
    return (suggestedRecipes.map(recipe => Number(recipe.min_price)).reduce((a,b) => a + b, 0)).toFixed(2);
  }

  const getTotalBonus = () => {
    return suggestedRecipes.map(recipe => Number(recipe.bonus_price) - Number(recipe.min_price)).reduce((a,b) => a + b, 0).toFixed(2);
  }

  useEffect(() => {
    getSuggestions();
  }, []);

  const getSuggestions = () => {
    axios.get("/api/recipes/suggest")
      .then((response) => {
        setsuggestedRecipes(response.data.recipes);
        setShareText(response.data.shareText);
      });
  }

  const suggestedRecipeCards = suggestedRecipes.map((val, key) => {
    return (
        <RecipeCard recipe={val} key={key} secondButtonIcon={Shuffle} />
    )
  });
  
  return (
    <div className='Suggestions'>
        <Container className='info' fluid>
          <Row>
              <Card className='info-item'>
                <div className='card-body info-body'>
                  <span className='info-card-text'>Total cost:</span>
                  <span className='info-card-amount'>€{getTotalCost()}</span> 
                </div>
              </Card>

              <Card className='info-item'>
                <div className='card-body info-body'>
                  <span className='info-card-text'>Bonus:</span>
                  <span className='info-card-amount'>€{getTotalBonus()}</span> 
                </div>
              </Card>
              <WhatsappShareButton
                url={'https://recipes.sdebruin.nl'}
                title={shareText}
                className='info-item'
              >
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
              {/* <Button className='info-item'><Share size={24} /> Ingredients</Button> */}
              <Button className='info-item'><Shuffle size={24} /> Re-suggest</Button>
          </Row> 
        </Container>
        <Container className='suggestion-cards' fluid>
            <Row>
                {suggestedRecipeCards}
            </Row>
        </Container>
    </div>
  );
}

export default Suggestions;