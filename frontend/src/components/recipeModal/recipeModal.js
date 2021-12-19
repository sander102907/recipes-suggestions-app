import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Button, Modal, Form, FloatingLabel } from 'react-bootstrap'
import IngredientsSearchBar from "../searchIngredients/searchIngredients";
import ReactStars from "react-rating-stars-component";
import IngredientsList from '../ingredientsList/ingredientsList';

const RecipeModal = (props) => {
  const [ingredients, setIngredients] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const ingredientsSearchBar = useRef(null);

  useEffect(() => {
    if (props.edit) {
      setIngredients(props.ingredients);
      setName(props.name);
      setDescription(props.description);
      setRating(props.rating);
    } else {
      setIngredients([]);
      setName('');
      setDescription('');
      setRating(0);
    }
  }, [props.edit, props.ingredients, props.name, props.description, props.rating])

  const addIngredientToRecipe = (ingredient, recipe_id) => {
    axios.get(`/api/ingredient/ah/${ingredient.ah_id}`, {params: ingredient})
    .then((response) => {
      axios.post("api/recipe/ingredient", { recipe_id: recipe_id, ingredient_id: response.data.id })
    });
  }

  const addIngredient = (suggestion) => {
    const ingredient = {
      name: suggestion.title,
      price: suggestion.priceBeforeBonus,
      bonus_price: suggestion.currentPrice, 
      is_bonus: suggestion.isBonus,
      bonus_mechanism: suggestion.bonusMechanism,
      unit_size: suggestion.salesUnitSize,
      category: suggestion.mainCategory,
      image_tiny: suggestion.images[0].url,
      image_small: suggestion.images[1].url,
      image_medium: suggestion.images[2].url,
      image_large: suggestion.images[3].url,
      ah_id: suggestion.webshopId
    };
    setIngredients([...ingredients, ingredient])
  }

  const removeIngredient = (index) => {
    const ingredients_copy = [...ingredients];
    ingredients_copy.splice(index, 1);
    setIngredients(ingredients_copy);
  }

  const createRecipe = (recipe) => {
    axios.post('/api/recipe', recipe)
        .then((response) => { 
          const promises = []

          ingredients.forEach(ingredient => {
            promises.push(addIngredientToRecipe(ingredient, response.data.id));
          });

          Promise.all(promises).then(() => {
            props.getRecipes();
            props.onHide();
          })
      });
  }

  const updateRecipe = (recipe) => {
    axios.put(`/api/recipe/${props.id}`, recipe)
        .then((response) => { 
          axios.delete(`/api/recipe/${props.id}/ingredients`).then(() => {
            const promises = []

            ingredients.forEach(ingredient => {
              promises.push(addIngredientToRecipe(ingredient, response.data.id));
            });

            Promise.all(promises).then(() => {
              props.getRecipes();
              props.onHide();
            });
          });
      });
  }

  const submit = () => {
    const recipe = {
      name: name,
      description: description,
      rating: rating
    };

    if (props.edit) {
      updateRecipe(recipe);
    } else {
      createRecipe(recipe);
    }

    setIngredients([]);
    setName('');
    setDescription('');
    setRating(0);
  }

  const coupleIngredient = (index) => {
    ingredientsSearchBar.current.focus();
  }

    return (
      <Modal
        {...props}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
          {props.edit === true ? 'Update Recipe' : 'New Recipe'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReactStars
            count={5}
            onChange={setRating}
            size={32}
            activeColor="#8c0269"
          />
          <FloatingLabel
            controlId="floatingInput"
            label="Recipe name"
            className="mb-3"
          >
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
             />
          </FloatingLabel>
          <FloatingLabel controlId="floatingTextarea2" label="Description" className="mb-3">
            <Form.Control
              as="textarea"
              style={{ height: '100px' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FloatingLabel>
          <IngredientsSearchBar onClick={addIngredient} refVar={ingredientsSearchBar}/>
          <IngredientsList 
            ingredients={ingredients} 
            maxHeight={'260px'} 
            onRemove={removeIngredient}
            onOr={coupleIngredient} 
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
          <Button onClick={() => submit()}>{props.edit === true ? 'Update' : 'Add'}</Button>
        </Modal.Footer>
      </Modal>
    );
}

export default RecipeModal;
  