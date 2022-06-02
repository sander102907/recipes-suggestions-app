import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../searchBar';

const mockedOnSearch = jest.fn();
const placeholderText = "placeholder text";

describe("SearchBar", () => {
    beforeEach(() => {
        render(
            <SearchBar
                placeholderText={placeholderText}
                onSearch={mockedOnSearch}
            />
        );
    });

    it("should render search bar with the correct placeholder text", () => {
        const searchBar = screen.getByPlaceholderText(placeholderText);
        expect(searchBar).toBeInTheDocument();
    });

    it("should be able to type into the search bar and call the onSearch function when pressing the button", () => {
        const searchString = "test value";

        // Get the search bar and the button
        const searchBar = screen.getByPlaceholderText(placeholderText);
        const button = screen.getByRole("button", { name: /Zoeken/i });

        // Click the search bar and fill it with the search string
        fireEvent.click(searchBar)
        fireEvent.change(searchBar, { target: { value: searchString } });

        //  Expect the search string to be the searchbar value
        expect(searchBar.value).toBe(searchString);

        // Press the button and verify that the onSearch function has been called with the value
        fireEvent.click(button);
        expect(mockedOnSearch).toBeCalledWith(searchString);

        // Expect the search string to still be the searchbar value
        expect(searchBar.value).toBe(searchString);
    });

    it("should be able to type into the search bar and call the onSearch function when pressing the enter key on the keyboard", () => {
        const searchString = "test value";

        // Get the search bar and the button
        const searchBar = screen.getByPlaceholderText(placeholderText);

        // Click the search bar and fill it with the search string
        fireEvent.click(searchBar)
        fireEvent.change(searchBar, { target: { value: searchString } });

        // Expect the search string to be the searchbar value
        expect(searchBar.value).toBe(searchString);

        // Press the button and verify that the onSearch function has been called with the value
        fireEvent.keyDown(searchBar, { key: 'Enter' });
        expect(mockedOnSearch).toBeCalledWith(searchString);

        // Expect the search string to still be the searchbar value
        expect(searchBar.value).toBe(searchString);
    });

    it("should only show the reset input button when there is any input", () => {
        const searchString = "test value";

        // Get the search bar and the button
        const searchBar = screen.getByPlaceholderText(placeholderText);

        let resetInputButton = screen.queryByRole('button', { name: /reset-input/i });

        expect(resetInputButton).not.toBeInTheDocument();

        // Click the search bar and fill it with the search string
        fireEvent.click(searchBar)
        fireEvent.change(searchBar, { target: { value: searchString } });

        // Try to get the element again
        resetInputButton = screen.queryByRole('button', { name: /reset-input/i });

        // the reset input button should appear now
        expect(resetInputButton).toBeInTheDocument();
    });

    it("should clear the input and call onsearch with empty string when pressing reset input button", () => {
        const searchString = "test value";

        // Get the search bar and the button
        const searchBar = screen.getByPlaceholderText(placeholderText);

        // Click the search bar and fill it with the search string
        fireEvent.click(searchBar);
        fireEvent.change(searchBar, { target: { value: searchString } });

        // Try to get the element again
        const resetInputButton = screen.queryByRole('button', { name: /reset-input/i });

        fireEvent.click(resetInputButton);

        expect(mockedOnSearch).toBeCalledWith("");

        // Expect the search string to be cleared
        expect(searchBar.value).toBe("");
    });

    it.each([
        ["a"],
        ["Escape"],
        ["8"],
        ["("],
        ["Return"],
        ["Delete"]
    ])("should not trigger onsearch with key press '%s'", (key) => {
        // Get the search bar and the button
        const searchBar = screen.getByPlaceholderText(placeholderText);

        // Press the button and verify that the onSearch function has not been called
        fireEvent.keyDown(searchBar, { key: key });
        expect(mockedOnSearch).not.toBeCalled();
    })
})