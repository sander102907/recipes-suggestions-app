import React from 'react';
import { useState } from "react";
import axios from 'axios';
import './searchIngredients.css';
import { Button, Badge } from 'react-bootstrap'
import { Plus, Search } from 'react-bootstrap-icons';

const IngredientsSearchBar = (props) => {
    
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsActive, setSuggestionsActive] = useState(false);
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    const query = e.target.value.toLowerCase();
    setValue(query);
    if (query.length > 1) {
      axios.get("/api/ah/search", {params: { query: query }})
        .then((response) => {
            console.log(response.data);
            setSuggestions(response.data);
            setSuggestionsActive(true);
        })
    } else {
      setSuggestions([])
      setSuggestionsActive(false);
    }
  };

    const expand = () => {
      setSuggestionsActive(true);
  }

  const close = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setSuggestionsActive(false);
    }
  }

  const handleClick = (suggestion) => {
    axios.get(`/api/ingredient/ah/${suggestion.webshopId}`, {params: { name: suggestion.title }}).then((response) => {
      axios.post("api/recipe/ingredient", { recipe_id: props.recipeId, ingredient_id: response.data.id }).then((response) => {
        setSuggestionsActive(false);
        setSuggestions([]);
        setValue("");
        props.getIngredients();
      });
    })
  };

  const Suggestions = () => {
    return (
      <div className="dropdown suggestions">
          {suggestions.map((suggestion, index) => {
            return (
              <div
                className="dropdownItem"
                key={index}
              >
                <div>
                  {suggestion.images.length > 0 ? <img src={suggestion.images[0].url} alt="" /> : null}
                </div>
                <span className="dropdownItemText">
                  {suggestion.title}
                  {suggestion.isBonus ? <Badge className="dropdownItemBonusBadge" bg="info">{suggestion.bonusMechanism}</Badge> : null}
                </span>
                <Button className="dropdownItemButton" variant="success" onClick={() => handleClick(suggestion)}><Plus size={24} /></Button>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className="autocomplete" tabIndex="0" onFocus={expand} onBlur={close}>
      <Search size={16} color="darkgrey" class="searchIcon" />
      <input
        className="searchBar"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Add ingredient"
      />
      {suggestionsActive && suggestions.length > 0 && <Suggestions />}
    </div>
  );
  
};

export default IngredientsSearchBar;