import React from "react";
import { useState } from "react";
import "./searchBar.css";
import { XLg } from "react-bootstrap-icons";

type Props = {
  placeholderText: string,
  onSearch: (query: string) => void
}

const SearchBar = ({
  placeholderText,
  onSearch,

}: Props) => {
  const [value, setValue] = useState("");

  const handleKeyDown = (event: React.KeyboardEvent) => {
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
        Zoeken
      </button>
    </div>
  );
};

export default SearchBar;
