import React, { useCallback, useEffect } from 'react';
import { useState } from "react";
import axios from 'axios';
import './suggestionCard.css';
import { Button, Card, Badge } from 'react-bootstrap'
import IngredientsSearchBar from "../searchIngredients/searchIngredients";


const SuggestionCard = (props) => {
    const [ingredients, setIngredients] = useState([]);

    const recipeId = props.recipe.id;

    const getIngredients = useCallback(() => {
        axios.get(`/api/recipe/${recipeId}/ingredients`)
            .then((response) => {
                setIngredients(response.data);
                console.log(response.data);
        });
    }, []);

    useEffect(() => {
        getIngredients();
    }, [getIngredients]);        

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
            <Card.Body>
                <Card.Title>{props.recipe.name}</Card.Title>
                {props.recipe.description}
                <Ingredients />
            </Card.Body>
        </Card>
    </React.Fragment>
  );
  
};

export default SuggestionCard;