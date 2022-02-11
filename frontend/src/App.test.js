import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders recipes text", () => {
  render(<App />);
  expect(screen.getAllByText('Recipesxxxx')[0]).toBeInTheDocument();
});
