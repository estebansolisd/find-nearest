import { useEffect, useState } from "react";
import { debounce } from "lodash";
import data from "./data/cities.json";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const debouncedSearch = useCallback(
    debounce((term) => {
      // Implement your search logic here, potentially using an API call
      const nearCity = data.find(item);
      setResults(results);
    }, 500), // Adjust delay as needed (in milliseconds)
    [], // Empty dependency array to avoid recreating debouncedSearch on every render
  );

  // Call debouncedSearch whenever searchTerm changes
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  return (
    <>
      <label htmlFor="searchbox">Find a city:</label>
      <input id="searchbox" value={search} onChange={onChange} />
      <ul>
        {results.map((result) => {
          <li key={result.id}>{result.description}</li>;
        })}
      </ul>
    </>
  );
}

export default App;
