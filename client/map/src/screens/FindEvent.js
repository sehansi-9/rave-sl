import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

const FindEvent = ({ map, setMap }) => {
  const [data, setData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState("");
  const [cityEvents, setCityEvents] = useState([]);
  const [date, setDate] = useState("");
 

  useEffect(() => {
    fetch("/allevents", { //to display all events in map
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setData(result.events);
        result.events.forEach((event) => {
          const { lat, lng, title, body, dateTime } = event;

          const eventDate = new Date(dateTime); // converting ISO 8601 date-time string back in to date and time constants as two
          const date = eventDate.toLocaleDateString(); 
          const time = eventDate.toLocaleTimeString();

          L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`
              <div style="text-align:center;">
                <h3 style="color:#007bff;">${title}</h3>
                <p>${body}</p>
                <p>Date: ${date}</p>
                <p>Time: ${time}</p>
              </div>
            `);
        });
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
      });
  }, [setMap]);

  const searchPlace = async (place) => {
    try {
      const sriLankaBoundingBox = "79.6954,5.8754,81.8816,9.8354";

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${place}&viewbox=${sriLankaBoundingBox}&bounded=1`
      );
      const searchData = await response.json();
      setSearchResults(searchData);

      if (searchData.length > 0) {
        const { lat, lon } = searchData[0];
        const position = [lat, lon];
        map.setView(position, 10);
        const cityBounds = map.getBounds();

        // Filter events within the city bounds
        const eventsInCity = data.filter((event) => {
          const eventLatLng = L.latLng(event.lat, event.lng);
          return cityBounds.contains(eventLatLng);
        });

        setCityEvents(eventsInCity);
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 13);
          }
        );
      }
    } catch (error) {
      console.error("Error searching for place:", error);
    }
  };

  const cityDateFilter = () => {
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    if (cityEvents.length < 1) {
      const dateFiltered = data.filter((event) => {
        const eventDate = new Date(event.dateTime);
        return eventDate >= startOfDay && eventDate <= endOfDay;
      });

      console.log("Filtered events by date:", dateFiltered);
    return dateFiltered;
  
    }

    const cityDateFiltered = cityEvents.filter((event) => {
      const eventDate = new Date(event.dateTime);
      return eventDate >= startOfDay && eventDate <= endOfDay;
    });

    console.log("Filtered events by date and city:", cityDateFiltered);
    return cityDateFiltered;
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) { // start searching after 3 characters
      await searchPlace(value);
    } else {
      setSearchResults([]); // Clear results if input is too short
    }
  };

  return (
    <div>
      <div className="option-container">
      <input
        className = "input-fields" 
        type="text"
        value={query}
        placeholder="Search for a place or zoom the map"
        onChange={handleSearchChange}
      />
      {searchResults.length > 0 && (
        <ul style={{ listStyle: "none",marginTop:"-6px" }}>
          {searchResults.map((result, index) => (
            <li
            className="search-results"
              key={index}
              onClick={() => {
                const { lat, lon } = result;
                const position = [lat, lon];
                map.setView(position, 10);
                setQuery(result.display_name);
                setSearchResults([]);
              }}
              style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }}
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}
      <div style={{ display:"flex", flexDirection:"row" }}>
      <input
        className = "input-fields" 
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      
      </div>
      <div className="bttn-div">
      <button onClick={cityDateFilter} className="post-bttn">
        Filter
      </button>
      </div>
      </div>
    </div>
  );
};

export default FindEvent;
