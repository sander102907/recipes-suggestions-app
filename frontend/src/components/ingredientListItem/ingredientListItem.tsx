import "./ingredientListItem.css";
import { Badge } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import { Ingredient } from "../../interfaces/Ingredient";

type Props = {
  ingredient: Ingredient,
  includeButton: boolean,
  handleClick: (ingredient: Ingredient) => void
}

const IngredientListItem = ({ ingredient, includeButton, handleClick }: Props) => {
  return (
    <div
      className="dropdownItem"
      onClick={() => { !includeButton && handleClick(ingredient) }}
      style={{ 'cursor': includeButton ? '' : 'pointer' }}
    >
      <div>
        <img
          src={ingredient.image}
          alt={ingredient.name}
        />
      </div>
      <div className="dropdownItemInfo">
        <div className="dropdownItemText">
          {ingredient.name}
          {ingredient.isBonus ? (
            <Badge className="dropdownItemBonusBadge" bg="info">
              {ingredient.bonusMechanism}
            </Badge>
          ) : null}
        </div>
        <div className="dropdownItemDetails">
          <div className="dropdownItemUnitSize">
            {ingredient.unitSize}
          </div>
          <div className="dropdownItemPrice">
            €{ingredient.price}
          </div>
        </div>
      </div>
      {includeButton && <button
        className="dropdownItemButton"
        onClick={() => handleClick(ingredient)}
      >
        <Plus size={24} />
      </button>}
    </div>
  );
};

export default IngredientListItem;
