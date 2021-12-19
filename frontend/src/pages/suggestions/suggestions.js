import React, { useEffect, useState } from 'react';
import './suggestions.css';
import axios from 'axios';
import { Container, Row, Card, Button } from 'react-bootstrap'
import { Shuffle, Share } from 'react-bootstrap-icons';
import RecipeCard from '../../components/recipeCard/recipeCard';

const Suggestions = () => {
  const [suggestedRecipes, setsuggestedRecipes] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bonus, setBonus] = useState(0);

  const getPriceInfo = () => {
    let totPrice = 0;
    let bonusPrice = 0;

    let promises = [];

    suggestedRecipes.forEach(recipe => {
      promises.push(axios.get(`/api/recipe/${recipe.id}/price`));
    });

    Promise.all(promises).then(responses => {
      responses.forEach(response => {
        totPrice += parseFloat(response.data.current_price);
        console.log(parseFloat(response.data.full_price), parseFloat(response.data.current_price))
        bonusPrice += parseFloat(response.data.full_price) - parseFloat(response.data.current_price);
      });

      setTotalPrice(totPrice.toFixed(2));
      setBonus(bonusPrice.toFixed(2));
    });
  }

  useEffect(() => {
    getSuggestions();
  }, []);

  useEffect(() => {
    getPriceInfo();
  }, [suggestedRecipes]);

  const getSuggestions = () => {
    axios.get("/api/suggest")
      .then((response) => {
        setsuggestedRecipes(response.data);
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
                  <span className='info-card-amount'>€{totalPrice}</span> 
                </div>
              </Card>

              <Card className='info-item'>
                <div className='card-body info-body'>
                  <span className='info-card-text'>Bonus:</span>
                  <span className='info-card-amount'>€{bonus}</span> 
                </div>
              </Card>
              <Button className='info-item'><Share size={24} /> Ingredients</Button>
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