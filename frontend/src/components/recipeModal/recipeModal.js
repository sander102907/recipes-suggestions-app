import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './recipeModal.css';
import { Button, Modal, Form, FloatingLabel } from 'react-bootstrap'
import IngredientsSearchBar from "../searchIngredients/searchIngredients";
import ReactStars from "react-rating-stars-component";
import IngredientsList from '../ingredientsList/ingredientsList';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RecipeModal = (props) => {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionLength, setDescriptionLength] = useState(1e10);
  const [rating, setRating] = useState(0);
  const [coupleMode, setCoupleMode] = useState(false);
  const [coupleGroup, setCoupleGroup] = useState(null);
  const ingredientsSearchBar = useRef(null);

  useEffect(() => {
    if (props.edit) {
      setGroups(props.groups);
      setName(props.name);
      setDescription(props.description);
      setRating(props.rating);
    } else {
      setGroups([]);
      setName('');
      setDescription('');
      setRating(0);
    }
  }, [props.edit, props.groups, props.name, props.description, props.rating])

  const addIngredientToGroup = async (ingredient, group_id) => {
    await axios.get(`/api/ingredients/ah/${ingredient.ah_id}`, {params: ingredient})
    .then((response) => {
      axios.post("api/groups/ingredient", { group_id: group_id, ingredient_id: response.data.id });
    });
  }

  const addGroupToRecipe = (recipe_id) => {
    return axios.post('/api/groups', { recipe_id: recipe_id })
        .then((response) => response.data.id);
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
    
    if (coupleMode) {
      let groups_copy = [...groups];
      groups_copy[coupleGroup].ingredients.push(ingredient);
      setCoupleMode(false);
      setCoupleGroup(null);
    } else {
      setGroups([...groups, {ingredients: [ingredient]}]);
    }
    
  }

  const removeIngredient = (group_index, ingredient_index) => {
    const groups_copy = [...groups];
    if (groups_copy[group_index].ingredients.length > 1) {
      groups_copy[group_index].ingredients.splice(ingredient_index, 1);
    } else {
      groups_copy.splice(group_index, 1);
    }
    setGroups(groups_copy);
  }

  const createRecipe = (recipe) => {
    axios.post('/api/recipes', recipe)
        .then((response) => { 
          const promises = []

          groups.forEach(group => {
            promises.push(addGroupToRecipe(response.data.id).then((group_id) => {
              group.ingredients.forEach(async (ingredient) => {
                await addIngredientToGroup(ingredient, group_id);
              });
            }));
          });

          Promise.all(promises).then(() => {
            props.getRecipes();
            props.onHide();
          });
      });
  }

  const updateRecipe = (recipe) => {
    axios.put(`/api/recipes/${props.id}`, recipe)
        .then(() => { 
          axios.delete(`/api/groups/recipe/${props.id}`).then(() => {
            const promises = []

            groups.forEach(group => {
              promises.push(addGroupToRecipe(props.id).then((group_id) => {
                group.ingredients.forEach(async (ingredient) => {
                  await addIngredientToGroup(ingredient, group_id);
                });
              }));
            });

            Promise.all(promises).then(() => {
              props.getRecipes(props.id);
              props.onHide();
            });
          });
      });
  }

  const submit = () => {
    const recipe = {
      name: name,
      description: descriptionLength > 1 ? description : '',
      rating: rating
    };

    if (props.edit) {
      updateRecipe(recipe);
    } else {
      createRecipe(recipe);
    }

    setGroups([]);
    setName('');
    setDescription('');
    setRating(0);
  }

  const coupleIngredient = (group_index) => {
    ingredientsSearchBar.current.focus();
    setCoupleMode(true);
    setCoupleGroup(group_index);
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
            value={props.rating}
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
            <ReactQuill 
            className="description mb-3"
              theme="snow" 
              value={description} 
              onChange={setDescription} 
              onBlur={(previousRange, source, editor) => setDescriptionLength(editor.getLength())} 
              placeholder={"Description"} 
            />
          <IngredientsSearchBar onClick={addIngredient} refVar={ingredientsSearchBar}/>
          <IngredientsList 
            groups={groups} 
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
  