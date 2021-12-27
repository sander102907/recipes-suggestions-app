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
    props.onClick(suggestion);
    setSuggestionsActive(false);
    setValue('');
    setSuggestions([]);
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
                  {suggestion.images.length > 1 ? <img src={suggestion.images[1].url} alt="" /> : null}
                </div>
                <div className="dropdownItemInfo">
                  <div className="dropdownItemText">
                    {suggestion.title} 
                    {suggestion.isBonus ? <Badge className="dropdownItemBonusBadge" bg="info">{suggestion.bonusMechanism}</Badge> : null}
                  </div>
                  <div className="dropdownItemDetails">
                    <div className="dropdownItemUnitSize">
                      {suggestion.salesUnitSize}
                    </div>
                    <div className="dropdownItemPrice">
                      €{suggestion.priceBeforeBonus != null ? suggestion.priceBeforeBonus : suggestion.currentPrice}
                    </div>
                  </div>
                </div>
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
        ref={props.refVar}
      />
      {suggestionsActive && suggestions.length > 0 && <Suggestions />}
    </div>
  );
  
};

export default IngredientsSearchBar;