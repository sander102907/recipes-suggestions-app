import React, { useEffect, useState } from 'react';
import './suggestions.css';
import axios from 'axios';
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { Clipboard, Shuffle } from 'react-bootstrap-icons';
import SuggestionCard from "../../components/suggestionCard/suggestionCard";

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
        <SuggestionCard recipe={val} key={key} />
    )
  });
  
  return (
    <div className='Suggestions'>
        <Container className='info' fluid>
          <Row>
              <Card className='info-item'>
                <span className='info-card-text'>Total cost:</span>
                <span className='info-card-amount'>€39.45</span> 
              </Card>

              <Card className='info-item'>
                <span className='info-card-text'>Bonus:</span>
                <span className='info-card-amount'>€7.32</span> 
              </Card>
              <Button className='info-item'><Clipboard size={24} /> Copy Ingredients</Button>
              <Button className='info-item'><Shuffle size={24} /> Re-suggest All</Button>
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