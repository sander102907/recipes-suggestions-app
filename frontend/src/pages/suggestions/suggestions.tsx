import "./suggestions.css";
import RecipeList from "../../components/recipeList/recipeList";
import { Shuffle } from "react-bootstrap-icons";
import { useEffect, useState } from "react";
import axios from "axios";
import GroceryList from "../../components/groceryList/groceryList";
import { Tabs, Tab } from "react-bootstrap";
import { Recipe } from "../../interfaces/Recipe";


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

  const onRemove = async (recipeId: number) => {
    await axios.patch(`/api/recipes/${recipeId}`, {
      isSuggested: false,
      excludeFromSuggestions: true
    });

    getRecipes();
  }

  const replaceSuggestion = async (recipe: Recipe) => {
    await axios.patch(`/api/recipes/${recipe.id}`, {
      isSuggested: false,
      excludeFromSuggestions: true
    });


    await axios.put('/api/recipes/suggest-single');

    getRecipes();
  }


  return (
    <div className="Suggestions">
      <Tabs defaultActiveKey="recipes" className="mb-3 suggestions-tabs">
        <Tab eventKey="recipes" title="Menu van deze week">
          <RecipeList
            recipes={recipes}
            SecondButtonIcon={Shuffle}
            onRemove={onRemove}
            onSecondButtonClick={replaceSuggestion} />
        </Tab>
        <Tab eventKey="groceries" title="Boodschappenlijstje">
          <GroceryList recipes={recipes} />
        </Tab>
      </Tabs>
    </div>
  );
};

export default Suggestions;
