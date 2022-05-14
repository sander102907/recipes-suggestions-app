import "./suggestions.css";
import RecipeList from "../../components/recipeList/recipeList";
import { Shuffle } from "react-bootstrap-icons";

const Suggestions = () => {
  return (
    <div className="Suggestions">
      <RecipeList getRecipesUrl={"/api/recipes/suggest"} SecondButtonIcon={Shuffle} onRemove={() => { }} onSecondButtonClick={() => { }} />
    </div>
  );
};

export default Suggestions;
