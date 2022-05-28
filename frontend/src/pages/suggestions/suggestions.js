import "./suggestions.css";
import RecipeList from "../../components/recipeList/recipeList";
import { Shuffle } from "react-bootstrap-icons";
import { useEffect, useState } from "react";
import axios from "axios";

const Suggestions = () => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    getRecipes();
  }, []);

  const getRecipes = () => {
    axios.get('/api/recipes/suggest').then((response) => {
      setRecipes(response.data);
    });
  };


  return (
    <div className="Suggestions">
      <RecipeList recipes={recipes} SecondButtonIcon={Shuffle} onRemove={() => { }} onSecondButtonClick={() => { }} />
    </div>
  );
};

export default Suggestions;
