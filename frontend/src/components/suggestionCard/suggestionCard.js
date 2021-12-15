import React, { useCallback, useEffect } from 'react';
import { useState } from "react";
import axios from 'axios';
import './suggestionCard.css';
import { Shuffle, XLg } from 'react-bootstrap-icons';
import { Button, Card, Badge } from 'react-bootstrap'

const SuggestionCard = (props) => {
    const [ingredients, setIngredients] = useState([]);
    const [currentRecipePrice, setCurrentRecipePrice] = useState(0);
    const [fullRecipePrice, setFullRecipePrice] = useState(0);

    const recipeId = props.recipe.id;

    const getIngredients = useCallback(() => {
        axios.get(`/api/recipe/${recipeId}/ingredients`)
            .then((response) => {
                setIngredients(response.data);
                console.log(response.data);
        });
    }, []);

    const getRecipePrice = useCallback(() => {
        axios.get(`/api/recipe/${recipeId}/price`)
            .then((response) => {
                setCurrentRecipePrice(response.data.current_price);
                setFullRecipePrice(response.data.full_price);
        });
    }, []);

    useEffect(() => {
        getIngredients();
        getRecipePrice();
    }, [getIngredients, getRecipePrice()]);        

    const remove = () => {
        if (window.confirm("Do you want to delete? ")) {
            axios.delete(`/api/recipe/${recipeId}`).then(() => {
                props.getRecipes();
            });
        };
    };
      

    const Ingredients = () => {
        return (
            <div className="ingredients">
                <h5 className='ingredients-title'>Ingredients</h5>
                    {ingredients.map((ingredient, index) => {
                        return (
                            <div className="item">
                                <div className="itemText">
                                    {ingredient.name} 
                                    {ingredient.is_bonus ? <Badge className="itemBonusBadge" bg="info">{ingredient.bonus_mechanism}</Badge> : null}
                                </div>
                                <div className="itemDetails">
                                    <div className="itemUnitSize">
                                    {ingredient.unit_size}
                                    </div>
                                    <div className="itemPrice">
                                    €{ingredient.bonus_price != null ? ingredient.bonus_price : ingredient.price}
                                    </div>
                                </div>
                            </div>                            
                        );
                    })}
            </div>
        );
    } 

  return (
    <React.Fragment>
        <Card className='recipeCard'>
            <Card.Body className='suggestion-card-body'>
                <Card.Title>{props.recipe.name}</Card.Title>
                {props.recipe.description}
                <div className='card-data'>
                    <Ingredients />
                    <div className='card-bottom'>
                        <div className='card-buttons'>
                            <Button className='card-button-delete'><XLg size={20} /></Button>
                            <Button className='card-button-shuffle'><Shuffle size={20} /></Button>
                        </div>
                        <div className='card-price'>
                            <span className='full-price'>€{fullRecipePrice}</span>
                            <span className='current-price'>€{currentRecipePrice}</span>
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    </React.Fragment>
  );
  
};

export default SuggestionCard;