import "./suggestions.css";
import RecipeList from "../../components/recipeList/recipeList";
import { Shuffle } from "react-bootstrap-icons";
import { useEffect, useState } from "react";
import axios from "axios";
import GroceryList from "../../components/groceryList/groceryList";
import { Tabs, Tab } from "react-bootstrap";


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
      <Tabs defaultActiveKey="recipes" className="mb-3 suggestions-tabs">
        <Tab eventKey="recipes" title="Menu van deze week">
          <RecipeList recipes={recipes} SecondButtonIcon={Shuffle} onRemove={() => { }} onSecondButtonClick={() => { }} />
        </Tab>
        <Tab eventKey="groceries" title="Boodschappenlijstje">
          <GroceryList recipes={recipes} />
        </Tab>
      </Tabs>
    </div>
  );
};

export default Suggestions;
