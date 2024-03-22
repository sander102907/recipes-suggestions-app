import React, { useEffect, useRef, useState } from "react";
import IngredientsSearchBar from "../../components/ingredientSearchBar/ingredientSearchBar";
import { Ingredient as IIngredient } from "../../interfaces/Ingredient";
import { PriceHistory } from "../../interfaces/PriceHistory";
import "./pricewatch.css";
import axios from "axios";
import PriceChart from "../../components/priceChart/priceChart";
import { Card, Form } from "react-bootstrap";
import Ingredient from "../../components/ingredient/ingredient";
import ahLogo from "../../assets/logo-ah.png";

const Pricewatch = () => {
  const [ingredient, setIngredient] = useState<IIngredient>();
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const ingredientsSearchBar = useRef<HTMLInputElement>(null);
  const [includeBonus, setIncludeBonus] = useState<boolean>(true);
  const [width, setWidth] = useState<string>('fit-content');
  const [showBonusSwitch, setShowBonusSwitch] = useState<boolean>(true);

  const onClickIngredient = async (AhIngredient: IIngredient) => {
    const ingredientResponse = await axios.get<IIngredient>(`/api/ingredients/ah/${AhIngredient.ahId}`);

    setIngredient(ingredientResponse.data);

    const response = await axios.get(`/api/ingredients/${ingredientResponse.data.id}/priceHistory`);

    setPriceHistory(response.data);
  }

  const getAveragePriceHistory = async () => {
    const response = await axios.get(`/api/ingredients/avg/priceHistory?includeBonus=${includeBonus}`);

    setPriceHistory(response.data);
    setIngredient({
      name: "Albert Heijn prijsverloop",
      ahId: 0,
      unitSize: "",
      price: response.data.at(-1).price,
      category: "",
      isBonus: false,
      bonusMechanism: null,
      bonusPrice: null,
      image: ahLogo,
      inAssortment: true
    });
  }

  useEffect(() => {
    ingredientsSearchBar.current?.addEventListener('click', () => {
      setWidth(ingredientsSearchBar.current?.parentElement?.parentElement?.offsetWidth.toString() + 'px');
      setShowBonusSwitch(false);
    });

    ingredientsSearchBar.current?.addEventListener('blur', e => {
      setTimeout(() => {
        setWidth('fit-content');
        setShowBonusSwitch(true);
      }, 100);
    });
  }, []);

  useEffect(() => {
    if (ingredient === undefined || ingredient.name === "Albert Heijn prijsverloop") {
      getAveragePriceHistory();
    }
  }, [includeBonus]);



  return (
    <>
      <div className="pricewatch-options">
        <IngredientsSearchBar
          onClick={onClickIngredient}
          includeButton={false}
          refVar={ingredientsSearchBar}
          placeholderText={"Product zoeken..."}
          style={{ 'width': width }}
        />
        {showBonusSwitch &&
          <Form.Check
            type="switch"
            className="bonus-switch"
            label="Incl. bonus"
            checked={includeBonus}
            onChange={() => setIncludeBonus(!includeBonus)}
          />}
      </div>
      {ingredient &&
        <Card className="ingr-price-info">
          <Ingredient ingredientInGroup={{ ingredientId: ingredient.id || 1, amount: 1, ingredient: ingredient }} showAmount={false} align={'row'} />
          <div className="price-statistics">
            <p>Min. Prijs: €{Math.min(...priceHistory.map(hist => hist.price))}</p>
            <p>Max. Prijs: €{Math.max(...priceHistory.map(hist => hist.price))}</p>
            <p>Gem. Prijs: €{(priceHistory.reduce((total, next) => total + next.price, 0) / priceHistory.length).toFixed(2)}</p>
          </div>

        </Card>}
      <Card className="pricechart-container">
        <PriceChart priceHistory={priceHistory} includeBonus={includeBonus} />
      </Card>
    </>
  );
};

export default Pricewatch;
