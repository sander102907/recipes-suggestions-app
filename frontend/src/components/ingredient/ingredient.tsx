import { Badge, OverlayTrigger, Popover } from "react-bootstrap";
import "./ingredient.css";
import { IngredientsInGroup } from "../../interfaces/IngredientsInGroup";
import { Icon, Shuffle } from "react-bootstrap-icons";
import IngredientAlternatives from "../ingredientAlternatives/ingredientAlternatives";
type Props = {
  ingredientInGroup: IngredientsInGroup,
  alternativeIngredientInGroups?: IngredientsInGroup[],
  showAmount?: boolean,
  align?: 'row' | 'column',
  ButtonIcon?: Icon,
  onButtonClick?: () => void
}

const Ingredient = ({
  ingredientInGroup,
  alternativeIngredientInGroups,
  showAmount = true,
  align = 'column',
  ButtonIcon,
  onButtonClick
}: Props) => {
  const ingredient = ingredientInGroup.ingredient;

  const alternativesPopover = (alternativeIngredientInGroups ? <Popover id="popover-basic">
    <Popover.Body>
      <IngredientAlternatives ingredientInGroups={alternativeIngredientInGroups} showAmount={showAmount} />
    </Popover.Body>
  </Popover> : undefined);

  return (
    <div className="ingredient-item" style={{ 'flexDirection': align, maxWidth: align == 'row' ? '200px' : '150px' }}>
      <div className="image-container">
        <img src={ingredient.image} className="image" alt={`${ingredient.name}`} />
        {ingredient.isBonus && (
          <Badge
            className="bonus-badge"
          >
            {ingredient.bonusMechanism}
          </Badge>
        )}
        {showAmount && <Badge
          className="amount-badge"
        >
          {ingredientInGroup.amount}
        </Badge>}
        {alternativesPopover &&
          <OverlayTrigger trigger="click" rootClose overlay={alternativesPopover} placement={'auto'}>
            <Shuffle className="alternatives-button" size={26} />
          </OverlayTrigger>
        }
        {ButtonIcon &&
          <ButtonIcon className="param-button" size={26} onClick={onButtonClick} />
        }
      </div>
      <div className="info">
        <div>
          {ingredient.name}
        </div>
        <div>
          {(ingredient.bonusPrice && ingredient.bonusPrice < ingredient.price) ?
            <><span className="bonus price-integer">
              {Math.floor(ingredient.bonusPrice)}.
            </span>
              <span className="bonus price-decimal">
                {(ingredient.bonusPrice % 1).toFixed(2).substring(2)}
              </span>
              <span className="normal-price">
                {ingredient.price}
              </span>
            </> :
            <>
              <span className="price-integer">
                {Math.floor(ingredient.price)}.
              </span>
              <span className="price-decimal">
                {(ingredient.price % 1).toFixed(2).substring(2)}
              </span>
            </>
          }
          <span className="unit-size">
            {ingredient.unitSize}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Ingredient;
