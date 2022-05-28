import React, { LegacyRef } from "react";
import { useState } from "react";
import axios from "axios";
import "./ingredientSearchBar.css";
import { Button, Badge } from "react-bootstrap";
import { Plus, Search } from "react-bootstrap-icons";
import { Ingredient } from "../../interfaces/Ingredient";
import { AhIngredient } from "../../interfaces/AhIngredient";
import IngredientListItem from "../ingredientListItem/ingredientListItem";
import { useEffect } from "react";

type Props = {
  onClick: (ingredient: Ingredient) => void,
  refVar: LegacyRef<HTMLInputElement>,
  query?: string
}

const IngredientsSearchBar = ({ onClick, refVar, query }: Props) => {
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [suggestionsActive, setSuggestionsActive] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    console.log(query);
    if (query !== undefined) {
      handleChange(query);
    }
  }, [query])

  const handleChange = (query: string) => {
    setValue(query);
    if (query.length > 1) {
      axios
        .get<AhIngredient[]>("/api/ingredients/ah/search", { params: { query: query } })
        .then(async (response) => {
          setSuggestions(response.data.map(mapToIngredient));
          setSuggestionsActive(true);
        });
    } else {
      setSuggestions([]);
      setSuggestionsActive(false);
    }
  };

  const expand = () => {
    setSuggestionsActive(true);
  };

  const close = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setSuggestionsActive(false);
    }
  };

  const handleClick = (suggestion: Ingredient) => {
    onClick(suggestion);
    setSuggestionsActive(false);
    setValue("");
    setSuggestions([]);
  };

  const mapToIngredient = (ahIngredient: AhIngredient): Ingredient => {
    return {
      ahId: ahIngredient.id,
      name: ahIngredient.title,
      unitSize: ahIngredient.price.unitSize,
      price: ahIngredient.price.was ? ahIngredient.price.was : ahIngredient.price.now,
      bonusPrice: ahIngredient.price.now,
      isBonus: !!ahIngredient.discount,
      category: ahIngredient.taxonomies[0].name,
      bonusMechanism: ahIngredient.shield ? ahIngredient.shield.text : null,
      image: ahIngredient.images[0].url
    }
  }

  const getIngredientByAhId = async (ahIngredientId: number): Promise<Ingredient> => {
    return (await axios.get<Ingredient>(`/api/ingredients/ah/${ahIngredientId}`)).data;
  }

  const Suggestions = () => {
    return (
      <div className="dropdown suggestions">
        <>
          {suggestions.map((suggestion, index) =>
            <IngredientListItem ingredient={suggestion} handleClick={handleClick} key={index} />
          )}
        </>
      </div>
    );
  };

  return (
    <div className="autocomplete" tabIndex={0} onFocus={expand} onBlur={close}>
      <Search size={16} color="darkgrey" className="searchIcon" />
      <input
        className="searchBar"
        type="text"
        value={value}
        onChange={event => handleChange(event.currentTarget.value.toLowerCase())}
        placeholder="Ingrediënten toevoegen.."
        ref={refVar}
      />
      {suggestionsActive && suggestions.length > 0 && <Suggestions />}
    </div>
  );
};

export default IngredientsSearchBar;
