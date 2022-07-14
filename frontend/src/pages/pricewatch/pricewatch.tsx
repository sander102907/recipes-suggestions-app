import React, { useEffect, useRef, useState } from "react";
import IngredientsSearchBar from "../../components/ingredientSearchBar/ingredientSearchBar";
import { Ingredient } from "../../interfaces/Ingredient";
import { PriceHistory } from "../../interfaces/PriceHistory";
import "./pricewatch.css";
import axios from "axios";
import { AhIngredient } from "../../interfaces/AhIngredient";


const Pricewatch = () => {
  const [ingredient, setIngredient] = useState<Ingredient>();
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const ingredientsSearchBar = useRef<HTMLInputElement>(null);

  const onClickIngredient = async (AhIngredient: Ingredient) => {
    const ingredientResponse = await axios.get<Ingredient>(`/api/ingredients/ah/${AhIngredient.ahId}`);

    setIngredient(ingredientResponse.data);

    const response = await axios.get(`/api/ingredients/${ingredientResponse.data.id}/priceHistory`);

    setPriceHistory(response.data);
  }

  return (
    <>
      <IngredientsSearchBar onClick={onClickIngredient} refVar={ingredientsSearchBar} />
      {priceHistory.map(item => <p>{item.price}</p>)}
    </>
  );
};

export default Pricewatch;
