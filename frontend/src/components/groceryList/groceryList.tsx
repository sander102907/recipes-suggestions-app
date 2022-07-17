import React, { useEffect, useRef, useState } from "react";
import "./groceryList.css";
import { Recipe } from "../../interfaces/Recipe";
import GroceryListItem from "../groceryListItem/grocerylistItem";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { GroceryWsMessage } from "../../interfaces/GroceryWsMessage";
import WebsocketHelper from "../../helpers/websocketHelper";
import IngredientsSearchBar from "../ingredientSearchBar/ingredientSearchBar";
import { Ingredient } from "../../interfaces/Ingredient";
import axios from "axios";
import { GroceryItem } from "../../interfaces/GroceriesItem";
import { Check2Circle, Sliders } from "react-bootstrap-icons";

type Props = {
  recipes: Recipe[]
}

const GroceryList = ({ recipes }: Props) => {
  const [ws, setWs] = useState(new W3CWebSocket(WebsocketHelper.getWsUrl()));
  const [wsMessage, setWsMessage] = useState<GroceryWsMessage>();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const ingredientsSearchBar = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<boolean>(false);

  const categories = [
    'Aardappel, groente, fruit',
    'Vlees, kip, vis, vega',
    'Salades, pizza, maaltijden',
    'Kaas, vleeswaren, tapas',
    'Bakkerij en banket',
    'Ontbijtgranen, broodbeleg, tussendoor',
    'Pasta, rijst en wereldkeuken',
    'Zuivel, plantaardig en eieren',
    'Soepen, sauzen, kruiden, olie',
    'Bewuste voeding',
    'Snoep, koek, chips en chocolade',
    'Wijn en bubbels',
    'Bier en aperitieven',
    'Diepvries',
    'Frisdrank, sappen, koffie, thee',
    'Huishuiden, huisdier',
    'Baby, verzorging en hygiëne',
    'Koken, tafelen, vrije tijd'
  ];

  useEffect(() => {
    axios.get('/api/grocerylist/').then(response => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    ws.onopen = () => {
      console.log('WebSocket Connected');
    }

    ws.onmessage = (e) => {
      const message: GroceryWsMessage = JSON.parse(e.data.toString());
      setWsMessage(message);
    }

    return () => {
      ws.onclose = () => {
        console.log('WebSocket Disconnected');
        setWs(new W3CWebSocket(WebsocketHelper.getWsUrl()));
      }
    }
  }, [ws.onmessage, ws.onopen, ws.onclose]);

  const wsSendMessage = (message: GroceryWsMessage) => {
    ws.send(JSON.stringify(message));
  }

  const deleteItem = (ingredientId: number) => {
    setItems(items.filter(item => item.ingredient.id !== ingredientId));
  }

  const addIngredient = async (ingredient: Ingredient) => {
    const ingrResponse = await axios.get(`/api/ingredients/ah/${ingredient.ahId}`);
    const itemResponse = await axios.post('/api/grocerylist', {
      ingredientId: ingrResponse.data.id,
      amount: 1,
      isCheckedOff: false,
      isPermanent: false
    });

    axios.get('/api/grocerylist/').then(response => {
      setItems(response.data);
    });
  }

  return (
    <div className="grocery-list">
      <div className="grocery-list-options">
        <IngredientsSearchBar
          onClick={addIngredient}
          refVar={ingredientsSearchBar}
          includeButton={true}
        />
        {editing ?
          <Check2Circle size={22} style={{ margin: '12px', cursor: 'pointer' }} onClick={() => setEditing(false)} /> :
          <Sliders size={22} style={{ margin: '12px', cursor: 'pointer' }} onClick={() => setEditing(true)} />}
      </div>
      <div className="grocery-list-container">
        {categories.map(category => {
          const catItems = items.filter(item => item.ingredient.category === category);
          return (
            <>
              {catItems.length > 0 &&
                <>
                  <h4>{category}</h4>
                  {catItems.map(item =>
                    <GroceryListItem
                      item={item}
                      recipes={recipes}
                      deleteItem={deleteItem}
                      wsSendMessage={wsSendMessage}
                      wsMessage={wsMessage}
                      editing={editing} />
                  )}
                </>
              }
            </>
          )
        })}
      </div>
    </div>
  );
};

export default GroceryList;
