import React from "react";
import { useState } from "react";
import "./searchBar.css";
import { Button } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";

const SearchBar = ({ 
    placeholderText,
    onSearch,
    
}) => {
  const [value, setValue] = useState("");

  return (
    <div className="searchbar-container">
      <input
        className="searchbar"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholderText}
      />
      <Button
        className="search-button"
        onClick={() => onSearch(value)}
        >
            <Search />
        </Button>
    </div>
  );
};

export default SearchBar;
