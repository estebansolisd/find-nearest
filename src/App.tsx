import { ChangeEvent, useCallback, useEffect, useState, useRef } from "react";
import { GeolocationRecord } from "./types";
import { calculateDistance } from "./utils";
import { v4 } from "uuid";

type State = {
  search: string;
  results: GeolocationRecord[];
  topFour: GeolocationRecord[];
  isLoading: boolean;
  currentId?: string;
};

function App() {
  const [state, setState] = useState<State>({
    search: "",
    results: [],
    topFour: [],
    isLoading: false,
  });
  const timeOutId = useRef<NodeJS.Timeout>();
  const geolocationRecords = useRef<GeolocationRecord[]>([]);

  const fetchGeolocationRecords = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch("/cities.json");
      const jsonData: Record<string, string>[] = await res.json();
      geolocationRecords.current = jsonData.map((prev) => ({
        ...prev,
        lat: Number(prev.lat),
        lng: Number(prev.lng),
        id: v4(),
      })) as GeolocationRecord[];
      setState((prev) => ({...prev, results: geolocationRecords.current}))
    } catch (err) {
      console.error(err, "error fetching geolocation records");
    }
    setState((prev) => ({ ...prev, isLoading: false }));
  };

  const debouncedSearch = useCallback((term: string) => {
    setState(prev => ({...prev, isLoading: true}))
    if (timeOutId.current) {
      clearTimeout(timeOutId.current);
    }

    timeOutId.current = setTimeout(() => {
      if (!term) {
        setState(prev => ({...prev, isLoading: false}))
        return setState((prev) => ({
          ...prev,
          results: geolocationRecords.current,
        }));
      }

      const nearCity = geolocationRecords.current.find((geoRecord) => {
        return geoRecord.name
          .toLowerCase()
          .trim()
          .includes(term.toLowerCase().trim());
      });

      if (!nearCity) {
        return;
      }

      const nearCities = geolocationRecords.current
        .filter((geoRecord) => geoRecord.id !== nearCity.id)
        .sort((a, b) => {
          const distanceA = calculateDistance(
            nearCity.lat,
            nearCity.lng,
            a.lat,
            a.lng
          );
          const distanceB = calculateDistance(
            nearCity.lat,
            nearCity.lng,
            b.lat,
            b.lng
          );
          const diff = distanceA - distanceB;
          return diff;
        });

      setState((prev) => ({
        ...prev,
        results: nearCities,
      }));
      setState(prev => ({...prev, isLoading: false}))

    }, 1000);
  }, []);

  useEffect(() => {
    fetchGeolocationRecords();
  }, []);

  const handleClick = (record: GeolocationRecord) => () => {
    const newTopFour = geolocationRecords.current
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      search: e.target.value,
      currentId: undefined,
    }));
    debouncedSearch(e.target.value);
  };

  return (
    <div className="min-h-screen h-full w-full">
      <div className="h-full w-full flex gap-2 p-10 flex-col">
        <div>
          <label htmlFor="searchbox">Find a city:</label>
          <div>
            <input
              placeholder="Write here..."
              id="searchbox"
              className="w-48 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 focus:outline-none hover:bg-gray-100 text-gray-700 placeholder-gray-400"
              value={state.search}
              onChange={handleChange}
            />
          </div>
          <div className={state.isLoading ? "visible" : "invisible"}>
            Loading...
          </div>
        </div>
        <ul className="h-96 w-56 overflow-y-auto bg-slate-200">
          {state.results.map((result) => {
            return (
              <li
                onClick={handleClick(result)}
                key={`autocomplete-${result.id}`}
                className={`w-full cursor-pointer ${
                  result.id === state.currentId ? "bg-slate-400 font-bold" : ""
                }`}
              >
                {result.name}
              </li>
            );
          })}
        </ul>

        {state.currentId && (
          <div data-testid="cercanos">
            <h6 className="font-bold">Cercanos: </h6>
            <ul className="h-96 w-56 overflow-y-auto">
              {state.topFour.map((result) => {
                return (
                  <li key={`top-four-${result.id}`} className="w-full">
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
