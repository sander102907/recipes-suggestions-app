import { Badge, Button, Card, Form, OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
import "./groceryListItem.css";
import { Dash, InfoCircleFill, Plus, Shuffle } from "react-bootstrap-icons";
import IngredientAlternatives from "../ingredientAlternatives/ingredientAlternatives";
import { Recipe } from "../../interfaces/Recipe";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { GroceryWsMessage } from "../../interfaces/GroceryWsMessage";
import { GroceryItem } from "../../interfaces/GroceriesItem";
import { IngredientsInGroup } from "../../interfaces/IngredientsInGroup";
import { RecipeIngredientsGroup } from "../../interfaces/RecipeIngredientsGroup";

type Props = {
  item: GroceryItem
  recipes: Recipe[],
  editing: boolean,
  deleteItem: (ingredientId: number) => void,
  wsSendMessage: (message: GroceryWsMessage) => void,
  wsMessage?: GroceryWsMessage
}

const GroceryListItem = ({
  item,
  recipes,
  editing,
  deleteItem,
  wsSendMessage,
  wsMessage
}: Props) => {
  const [checkedOff, setCheckedOff] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(1);
  const [isPermanent, setIsParmanent] = useState<boolean>(false);
  const [groceryAlternatives, setGroceryAlternatives] = useState<IngredientsInGroup[]>([]);

  useEffect(() => {
    setCheckedOff(item.isCheckedOff);
    setAmount(item.amount);
    setIsParmanent(item.isPermanent);
    setAlternatives();
  }, [item]);

  useEffect(() => {
    if (item.ingredient.id && wsMessage?.ingredientId === item.ingredient.id) {
      setCheckedOff(wsMessage.isCheckedOff);
    }
  }, [wsMessage])

  const setAlternatives = async () => {
    const groups = await Promise.all(item.groupIds.map(async (groupId) => {
      const groupResponse = await axios.get<RecipeIngredientsGroup>(`/api/groups/${groupId}`);
      return groupResponse.data;
    }));

    const ingrGroups = groups
      .flatMap(group => group.ingredientsInGroup)
      // Filter out duplicates and the actual ingredient (the non-alternative)
      .filter((group, idx, self) => (self.findIndex(t => t.ingredient.id === group.ingredient.id) === idx) && (group.ingredient.id !== item.ingredient.id))
    setGroceryAlternatives(ingrGroups);
  }


  const handleCheckToggle = async (checked: boolean) => {
    setCheckedOff(checked);
    await axios.patch('/api/grocerylist/', { ingredientId: item.ingredient.id, isCheckedOff: checked });

    if (item.ingredient.id !== undefined) {
      wsSendMessage({ ingredientId: item.ingredient.id, isCheckedOff: checked });
    }
  }

  const updateIngredientAmt = async (amount: number) => {
    await axios.patch('/api/grocerylist', {
      ingredientId: item.ingredient.id,
      amount: amount
    })
    setAmount(amount);

    if (amount <= 0 && item.ingredient.id) {
      deleteItem(item.ingredient.id);
    }
  }

  const updateIngredientPermanent = async (isPermanent: boolean) => {
    await axios.patch('/api/grocerylist', {
      ingredientId: item.ingredient.id,
      isPermanent: isPermanent
    });
    setIsParmanent(isPermanent);
  }

  const alternativesPopover = (groceryAlternatives.length > 0 ? <Popover id="popover-basic">
    <Popover.Body>
      <IngredientAlternatives ingredientInGroups={groceryAlternatives} showAmount={false} />
    </Popover.Body>
  </Popover> : undefined);

  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}>
      <Card className={`grocery-list-item ${checkedOff ? 'checkedoff' : ''}`} onClick={event => { handleCheckToggle(!checkedOff) }}>

        <div className="grocery-image-container">
          <img src={item.ingredient.image} className="grocery-item-image" alt={`${item.ingredient.name}`} />
          {item.ingredient.isBonus && (
            <Badge
              className="bonus-badge"
            >
              {item.ingredient.bonusMechanism}
            </Badge>
          )}
          {alternativesPopover &&
            <div onClick={event => event.stopPropagation()} style={{ display: 'inline-block' }}>
              <OverlayTrigger trigger="click" rootClose overlay={alternativesPopover} placement={'auto'}>
                <Shuffle className="alternatives-button" size={26} />
              </OverlayTrigger>
            </div>
          }
          {!editing && <Badge
            className="amount-badge"
          >
            {amount}
          </Badge>
          }
        </div>
        <div className="grocery-item-info">
          <div>
            <span className={`grocery-item-name ${checkedOff ? 'checkedoff' : ''}`}>{item.ingredient.name}</span>
            {item.recipeIds.length > 0 && <div onClick={event => event.stopPropagation()} style={{ display: 'inline-block' }}>
              <OverlayTrigger
                placement={'auto'}
                overlay={
                  <Tooltip>
                    Voor de recepten:
                    <ul>
                      {item.recipeIds.map(recipeId => {
                        const recipeName = recipes.find(recipe => recipe.id === recipeId)?.name;
                        return <li>{recipeName}</li>
                      })
                      }
                    </ul>
                  </Tooltip>
                }
              >
                <InfoCircleFill className="grocery-recipes-info" />
              </OverlayTrigger>
            </div>}
          </div>
          <div>
            {(item.ingredient.bonusPrice && item.ingredient.bonusPrice < item.ingredient.price) ?
              <><span className="bonus price-integer">
                {Math.floor(item.ingredient.bonusPrice)}.
              </span>
                <span className="bonus price-decimal">
                  {(item.ingredient.bonusPrice % 1).toFixed(2).substring(2)}
                </span>
                <span className="normal-price">
                  {item.ingredient.price}
                </span>
              </> :
              <>
                <span className="price-integer">
                  {Math.floor(item.ingredient.price)}.
                </span>
                <span className="price-decimal">
                  {(item.ingredient.price % 1).toFixed(2).substring(2)}
                </span>
              </>
            }
            <span className="unit-size">
              {item.ingredient.unitSize}
            </span>
          </div>
        </div>
        {editing ? <div className="grocery-edit-buttons">
          <div className="grocery-amt-buttons" >
            <Button
              variant=""
              className="subtract-button"
              onClick={event => { event.stopPropagation(); updateIngredientAmt(amount - 1) }}
            >
              <Dash size={24} />
            </Button>
            <input
              className="ingredient-amt grocery-amt"
              type="number"
              pattern="[0-9]{1,2}"
              maxLength={2}
              max={99}
              value={amount}
              onChange={event => { event.stopPropagation(); updateIngredientAmt(parseInt(event.target.value)) }}
            ></input>
            <Button
              variant=""
              className="add-button"
              onClick={event => { event.stopPropagation(); updateIngredientAmt(amount + 1) }}
            >
              <Plus size={24} />
            </Button>
          </div>
          <Badge
            className="permanent-button-badge"
            bg=""
            style={{ backgroundColor: isPermanent ? 'darkred' : 'grey' }}
            onClick={event => { event.stopPropagation(); updateIngredientPermanent(!isPermanent); }}>
            Permanent
          </Badge>
        </div> :
          <Form.Check
            className="grocery-list-item-checkbox"
            type={'checkbox'}
            onChange={event => handleCheckToggle(event.target.checked)}
            checked={checkedOff}
          />
        }
      </Card >
    </motion.div>
  );
};

export default GroceryListItem;
