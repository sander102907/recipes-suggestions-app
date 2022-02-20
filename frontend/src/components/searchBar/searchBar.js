import React from "react";
import { useState } from "react";
import "./searchBar.css";
import { XLg } from "react-bootstrap-icons";

const SearchBar = ({
  placeholderText,
  onSearch,

}) => {
  const [value, setValue] = useState("");

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSearch(value);
    }
  }

  const resetInput = () => {
    setValue("");
    onSearch("");
  }

  return (
    <div className="searchbar-container">
      <input
        className="searchbar"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholderText}
        onKeyDown={handleKeyDown}
      />
      {value.length > 0 &&
        <button className="reset-input-button" aria-label="reset-input" onClick={resetInput} >
          <XLg className="reset-input-icon" size={16} />
        </button>
      }
      <button
        className="search-button"
        onClick={() => onSearch(value)}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
