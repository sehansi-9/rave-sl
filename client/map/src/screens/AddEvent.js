import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState, useEffect, useRef } from "react";
import M from "materialize-css";

const AddEvent = ({ map }) => {
  const customIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/5149/5149694.png",
    iconSize: [38, 38],
  });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const markerRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState(""); // to update the search bar when a location is selected
  const [showCurrentLocation, setShowCurrentLocation] = useState(false);

  useEffect(() => {
    if (!map) return; // if map is not loaded return from function

    map.on("click", async function (e) {
      //for manual location picking
      if (markerRef.current) {
        // if marker holds a value
        map.removeLayer(markerRef.current); //that marker layer is removed from map for the newly selected layer
      }

      setLat(e.latlng.lat); //setting the lat and lon values
      setLng(e.latlng.lng);

      markerRef.current = L.marker([e.latlng.lat, e.latlng.lng], {
        icon: customIcon,
      }) // a new marker is added to the map
        .addTo(map)
        .bindPopup("Location Selected") // with the popup location selected
        .openPopup();

      // reverse geocoding to get the address of the selected point from nominatim map api
      const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&addressdetails=1`;

      try {
        const response = await fetch(reverseGeocodeUrl);
        const data = await response.json(); //
        if (data && data.display_name) {
          // checking if display name property of data and data is available
          const addressParts = data.display_name.split(",").slice(0, -2);
          const address = addressParts.join(", ").trim();
          setQuery(address);
          setAddress(address);
        } else {
          setQuery("Address not found");
        }
      } catch (error) {
        console.error("Error with reverse geocoding:", error);
        setQuery("Error retrieving address");
      }
    });
  }, [map]); //everytime the map changes with .addTo(map), run this code

  const searchPlace = async (place) => {
    try {
      const sriLankaBoundingBox = "79.6954,5.8754,81.8816,9.8354"; //making a sri lanka bounding box so that search results relevant to sri lanka will only appear

      const response = await fetch(
        //making the api call with the place given by user (inside sl box of course)
        `https://nominatim.openstreetmap.org/search?format=json&q=${place}&viewbox=${sriLankaBoundingBox}&bounded=1`
      );
      const data = await response.json();
      setSearchResults(data); //updating the search results through the setter
    } catch (error) {
      console.error("Error searching for place:", error);
    }
  };

  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }
          map.setView([latitude, longitude], 13);

          markerRef.current = L.marker([latitude, longitude], {
            icon: customIcon,
          })
            .addTo(map)
            .bindPopup("Current Location Selected")
            .openPopup();

          setLat(latitude); // set latitude
          setLng(longitude); // set longitude

          // reverse geocoding using latitude and longitude
          const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;

          try {
            const response = await fetch(reverseGeocodeUrl);
            const data = await response.json();
            setQuery("Current Location selected");
            if (data && data.display_name) {
              const addressParts = data.display_name.split(",").slice(0, -2);
              const address = addressParts.join(", ").trim();
              setAddress(address);
            } else {
              setQuery("Address not found");
            }
          } catch (error) {
            console.error("Error with reverse geocoding:", error);
            setQuery("Error retrieving address");
          }

          setShowCurrentLocation(false); // current location picking option disappears
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Error getting current location.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value; //targets the value typed by the user
    setQuery(value);
    if (value.length == 0) {
      setShowCurrentLocation(false);
    } else if (value.length <= 3) {
      // if user has only entered 3 or less characters of the place (too short)
      setShowCurrentLocation(true);
      setSearchResults([]);
    } else {
      setShowCurrentLocation(false);
      await searchPlace(value); //starts searching after 3 characters
    }
  };

  const postDetails = () => {
    if (!title || !body || !lat || !lng || !date || !time) {
      M.toast({ html: "Please fill in all fields", classes: "red darken-2" });
      return; // checking if all fields are filled or else error message is popped and returned, no data sent to backend
    }
    // else
    const dateTime = `${date}T${time}`; // making a new field dateTime for the database (ISO 8601 date-time string.)

    fetch("/createevent", {
      // fetching the backend api endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body,
        address,
        lat,
        lng,
        dateTime,
      }), // sending the stringified fields to backend
    })
      .then((res) => res.json()) // then jsonifying the response sent by the backend
      .then((data) => {
        if (data.error) {
          M.toast({ html: data.error, classes: "red darken-2" });
        } else {
          M.toast({ html: "Posted!", classes: "green darken-2" });

          const eventDate = new Date(dateTime);
          const date = eventDate.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
          const time = eventDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          const popupContent = `
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
                <i class="fas fa-map-marker-alt"> ${address}</i>
              </div>
            </div>
          </div>
        `;
          L.marker([lat, lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(popupContent)
            .openPopup(); //using values still stored in state instead of fetching from database again

          setTitle("");
          setBody("");
          setLat("");
          setLng("");
          setDate("");
          setTime("");
          setQuery("");
          setSearchResults("");
          setAddress("");
          showCurrentLocation(false); //after that all states are set back to null
          markerRef.current = null;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div>
      <div className="option-container">
        <input
          className="input-fields"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="input-fields"
          placeholder="Description"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="date-time">
          <input
            className="input-fields"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            className="input-fields"
            id="time-field"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <input
          className="input-fields"
          type="text"
          value={query}
          placeholder="Search for a place or pick from map"
          onFocus={() => setShowCurrentLocation(true)} // make the current location picking option visible
          onChange={handleSearchChange} // and with every letter user types we call the handleSearchChange function
        />
        {showCurrentLocation && ( // so if handleSearchChange made showCurrentLocation state true
          <ul style={{ listStyle: "none", marginTop: "-6px" }}>
            <li
              className="search-results"
              onClick={getCurrentLocation} // a clickable list item that will call the getCurrentLocation function
            >
              Pick Current Location
            </li>
          </ul>
        )}
        {searchResults.length > 0 && ( // else if there's an element in searchResult array
          <ul style={{ listStyle: "none", marginTop: "-6px" }}>
            {searchResults.map(
              (
                result,
                index // listing search results
              ) => (
                <li
                  className="search-results"
                  key={index}
                  onClick={() => {
                    // with clickable list items
                    const { lat, lon } = result; // gets the lat and lon of each result of the array
                    if (markerRef.current) {
                      map.removeLayer(markerRef.current); //remove previous marker value
                    }
                    const addressParts = result.display_name
                      .split(",")
                      .slice(0, -2);
                    const address = addressParts.join(", ").trim();

                    setAddress(address);
                    map.setView([lat, lon], 13); // set view to the new position
                    setLat(lat);
                    setLng(lon);
                    setShowCurrentLocation(false);
                    markerRef.current = L.marker([lat, lon], {
                      icon: customIcon,
                    }) // locates a new marker on that position
                      .addTo(map)
                      .bindPopup("Location Selected")
                      .openPopup();
                    setQuery(address);
                    setSearchResults([]); // clear search results
                  }}
                >
                  {result.display_name}
                </li>
              )
            )}
          </ul>
        )}
        <div className="bttn-div">
          <button className="post-bttn" onClick={postDetails}>
            Post Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEvent;
