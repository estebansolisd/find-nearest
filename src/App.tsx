import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import data from "./data/cities.json";
import { GeolocationRecord } from "./types";
import { calculateDistance } from "./utils";
import { v4 } from "uuid";

type State = {
  search: string;
  results: GeolocationRecord[];
  topFour: GeolocationRecord[];
  currentId?: string;
};

function App() {
  const [state, setState] = useState<State>({
    search: "",
    results: [],
    topFour: [],
  });
  const geolocationRecords = useMemo<GeolocationRecord[]>(
    () =>
      data.map((item) => ({
        ...item,
        id: v4(),
        lat: Number(item.lat),
        lng: Number(item.lng),
      })),
    []
  );

  const debouncedSearch = useCallback(
    debounce((term) => {
      setState((prev) => ({
        ...prev,
        results: term
          ? geolocationRecords
              .filter((city) =>
                city.name
                  .toLowerCase()
                  .trim()
                  .includes(term.toLowerCase().trim())
              )
              .sort((a, b) => {
                if (a.lat < b.lat) return -1;
                if (a.lat > b.lat) return 1;

                return a.lng - b.lng;
              })
          : geolocationRecords,
      }));
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(state.search);
  }, [state.search, debouncedSearch]);

  const handleClick = (record: GeolocationRecord) => () => {
    const newTopFour = geolocationRecords
      .filter((item) => item.id !== record.id)
      .sort((a, b) => {
        const distanceA = calculateDistance(
          record.lat,
          record.lng,
          a.lat,
          a.lng
        );
        const distanceB = calculateDistance(
          record.lat,
          record.lng,
          b.lat,
          b.lng
        );
        return distanceA - distanceB;
      })
      .slice(0, 4);

    setState((prev) => ({
      ...prev,
      currentId: record.id,
      topFour: newTopFour,
    }));
  };

  return (
    <div className="min-h-screen h-full w-full">
      <div className="h-full w-full flex gap-4 p-10 flex-col">
        <div>
          <label htmlFor="searchbox">Find a city:</label>
          <div>
            <input
              placeholder="Write here..."
              id="searchbox"
              className="w-48 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 focus:outline-none hover:bg-gray-100 text-gray-700 placeholder-gray-400"
              value={state.search}
              onChange={(e) =>
                setState((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
        </div>
        <ul className="h-96 w-56 overflow-y-auto bg-slate-200">
          {state.results.map((result) => {
            return (
              <li
                onClick={handleClick(result)}
                key={`${result.name}-${result.lat}-${result.lng}`}
                className={`w-full cursor-pointer ${result.id === state.currentId ? "bg-slate-400 font-bold" : ""  }`}
              >
                {result.name}
              </li>
            );
          })}
        </ul>

        {state.currentId && (
          <div>
            <h6 className="font-bold">Cercanos: </h6>
            <ul className="h-96 w-56 overflow-y-auto">
              {state.topFour.map((result) => {
                return (
                  <li key={`${result.id}`} className="w-full">
                    {result.name}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
