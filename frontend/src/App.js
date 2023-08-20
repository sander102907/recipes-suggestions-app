import "./App.css";
import Suggestions from "./pages/suggestions/suggestions";
import Recipes from "./pages/recipes/recipes";
import Pricewatch from "./pages/pricewatch/pricewatch";
import Settings from "./pages/settings/settings";
import Purchases from "./pages/purchases/purchases";
import Navigation from "./components/navigation/navigation";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Suggestions />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/pricewatch" element={<Pricewatch />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
