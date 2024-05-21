import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";
import data from "../data/cities.json"
import { vi } from "vitest";
vi.mock("lodash/debounce", () => vi.fn()); // Mock debounce for testing

describe("App component", () => {
  it("should render initial state", () => {
    render(<App />);
    expect(screen.getByLabelText("Find a city:")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("should filter results based on search term", () => {
    render(<App />);
    const searchInput = screen.getByRole("textbox");
    fireEvent.change(searchInput, { target: { value: "Bay Minette" } });
    expect(screen.getByText("Bay Minette")).toBeInTheDocument();
    expect(screen.queryByText("Edna")).not.toBeInTheDocument(); // Not displayed
  });

  it("should sort results by latitude and longitude", () => {
    render(<App />); // Provide mock data with lat/lng values
    const results = screen.getAllByRole("listitem");

    expect(results[0].textContent).toBe("Bay Minette"); // City B has lower latitude
    expect(results[1].textContent).toBe("Edna"); // City A has next lowest lat
  });

  it("should update currentId and topFour on clicking a result", () => {
    render(<App />);

    const cityBListItem = screen.getByText("Bay Minette");
    fireEvent.click(cityBListItem);
    waitFor(() => {
        expect(screen.getByText("Cercanos: ")).not.toBe(null);
        expect(screen.getByText("Creola")).toBeInTheDocument(); // Should be closest
    })
  });

  it("should handle empty search term", () => {
    render(<App />);
    const searchInput = screen.getByRole("textbox");
    fireEvent.change(searchInput, { target: { value: "" } });

    expect(screen.getAllByRole("listitem")).toHaveLength(data.length); // All results displayed
  });
});
