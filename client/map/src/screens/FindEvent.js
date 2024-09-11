import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

const customIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/5149/5149694.png",
  iconSize: [38, 38],
});

const FindEvent = ({ map, setMap }) => {
  const [data, setData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState("");
  const [cityEvents, setCityEvents] = useState([]);
  const [date, setDate] = useState("");

  useEffect(() => {
    fetch("/allevents", {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setData(result.events);
        result.events.forEach((event) => {
          const { lat, lng, title, body, dateTime } = event;

          const eventDate = new Date(dateTime);
          const date = eventDate.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
          const time = eventDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          L.marker([lat, lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <div class="event-card">
                <div class="event-image">
                  <img src="https://t3.ftcdn.net/jpg/02/87/35/70/360_F_287357045_Ib0oYOxhotdjOEHi0vkggpZTQCsz0r19.jpg" alt="Scuba Diving Event"></img>
                  <div class="event-date">
                    <span class="event-day">${date}</span>
                  </div>
                </div>
                <div class="event-details">
                  <h3 class="event-title">${title}</h3>
                  <p class="event-time">${date} | ${time}</p>
                  <p class="event-description">by organizer</p>
                  <div class="event-location">
                    <i class="fas fa-map-marker-alt"> 89, street lane, west, colombo</i>
                  </div>
                </div>
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
        const eventsInCity = data.filter((event) => {
          const eventLatLng = L.latLng(event.lat, event.lng);
          return cityBounds.contains(eventLatLng);
        });

        setCityEvents(eventsInCity);
      } else {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13);
        });
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

    if (value.length > 2) {
      await searchPlace(value);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div>
      <div className="option-container">
        <input
          className="input-fields"
          type="text"
          value={query}
          placeholder="Search for a place or zoom the map"
          onChange={handleSearchChange}
        />
        {searchResults.length > 0 && (
          <ul style={{ listStyle: "none", marginTop: "-6px" }}>
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
                style={{
                  cursor: "pointer",
                  padding: "5px",
                  borderBottom: "1px solid #ccc",
                }}
              >
                {result.display_name}
              </li>
            ))}
          </ul>
        )}

        <input
          className="input-fields"
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
  );
};

export default FindEvent;
