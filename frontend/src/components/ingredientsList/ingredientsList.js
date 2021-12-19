import React from 'react';
import { Badge } from 'react-bootstrap';
import './ingredientsList.css';
import { XLg } from 'react-bootstrap-icons';


const IngredientsList = (props) => {
    const maxHeight = props.maxHeight;
    return (
        <div className="ingredients" style={{'maxHeight': maxHeight}}>
            <h5 className='ingredients-title'>Ingredients</h5>
                {props.ingredients.length === 0 ? 'No ingredients yet, try adding some' : ''}
                {props.ingredients.map((ingredient, index) => {
                    return (
                        <div className="ingredient-item" key={index}>
                            <div className="ingredient-item-image">
                                <img src={ingredient.image_small} alt="" />
                            </div>
                            <div className='ingredient-item-info-container'>
                                <div className='ingredient-item-info'>
                                    <div className="ingredient-item-info-left">
                                        <div>
                                            {ingredient.name} {ingredient.is_bonus ? <Badge className="ingredient-bonus-badge" bg="info">{ingredient.bonus_mechanism}</Badge> : null}
                                        </div>
                                        <div className="ingredient-unit-size">
                                            {ingredient.unit_size}
                                        </div>
                                    </div>
                                    <div className="ingredient-item-info-right">
                                        <div className='ingredient-item-info-right-buttons'>
                                            {props.onOr != null ? <div className='ingredient-item-or' onClick={() => props.onOr(index)}>
                                                <Badge bg="info">OR</Badge>
                                            </div> : null}
                                            {props.onRemove != null ? <div className='ingredient-item-close' onClick={() => props.onRemove(index)}>
                                                <XLg />
                                            </div> : null}
                                        </div>
                                        <div className="ingredient-price">
                                        €{ingredient.bonus_price != null ? ingredient.bonus_price : ingredient.price}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                            
                    );
                })}
        </div>
    );
} 

export default IngredientsList;