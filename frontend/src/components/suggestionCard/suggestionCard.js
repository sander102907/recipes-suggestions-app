import React, { useCallback, useEffect } from 'react';
import { useState } from "react";
import axios from 'axios';
import './suggestionCard.css';
import { Shuffle, XLg } from 'react-bootstrap-icons';
import { Button, Card } from 'react-bootstrap'
import IngredientsList from '../ingredientsList/ingredientsList';
import ReactStars from "react-rating-stars-component";

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

  return (
    <React.Fragment>
        <Card className='recipeCard'>
            <Card.Body className='suggestion-card-body'>
                <ReactStars
                    value={props.recipe.rating}
                    size={32}
                    activeColor="#8c0269"
                    edit={false}
                />
                <Card.Title>{props.recipe.name}</Card.Title>
                {props.recipe.description}
                <div className='card-data'>
                    <IngredientsList ingredients={ingredients}/>
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