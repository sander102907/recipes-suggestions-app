import React, { useCallback, useEffect } from 'react';
import { useState } from "react";
import axios from 'axios';
import './recipeCard.css';
import { Button, Card, Badge } from 'react-bootstrap'
import IngredientsSearchBar from "../searchIngredients/searchIngredients";


const RecipeCard = (props) => {
    const [updateRecipeName, setUpdateRecipeName] = useState("");
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
      
    const update = () => {
        const updateRecipe = {
          name: updateRecipeName
        };
    
        axios.put(`/api/recipe/${recipeId}`, updateRecipe).then(() => {
            props.getRecipes();
            setUpdateRecipeName('');
        });
    };

    const handleChange = (event) => {
        setUpdateRecipeName(event.target.value);
    };

    const Ingredients = () => {
        return (
            <div className="ingredients">
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
                            // <div key={index} className="ingredient">
                            //     {ingredient.name}
                            // </div>
                        );
                    })}
            </div>
        );
    } 

  return (
    <React.Fragment>
        <Card className='m-2 recipeCard'>
            <Card.Body>
                <Card.Title>{props.recipe.name}</Card.Title>
                <div>
                    <input name='updateRecipeName' onChange={handleChange} placeholder='Update Recipe' ></input>
                </div>
                <Button className='m-2' onClick={() => { update() }}>Update</Button>
                <Button onClick={() => { remove() }}>Delete</Button>
                <IngredientsSearchBar recipeId={recipeId} getIngredients={getIngredients} />
                <Ingredients />
            </Card.Body>
        </Card>
    </React.Fragment>
  );
  
};

export default RecipeCard;