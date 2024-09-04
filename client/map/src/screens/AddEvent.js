import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState, useEffect, useRef } from "react";
import M from "materialize-css";

const AddEvent = ({ map }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [date, setDate] = useState(""); 
  const [time, setTime] = useState(""); 
  const markerRef = useRef(null); // initiating the map marker as null, (no marker)
  const [searchResults, setSearchResults] = useState([]); //to store the search results sent by the api 
  const [query, setQuery] = useState(""); // to update the search bar when a location is selected
  const [showCurrentLocation, setShowCurrentLocation] = useState(false); // to show or not to show the pick current location option

  useEffect(() => {
    if (!map) return; // if map is not loaded return from function

    map.on("click", async function (e) { //for manual location picking
      if (markerRef.current) { // if marker holds a value
        map.removeLayer(markerRef.current) //that marker layer is removed from map for the newly selected layer
      }

      setLat(e.latlng.lat) //setting the lat and lon values
      setLng(e.latlng.lng)

      markerRef.current = L.marker([e.latlng.lat, e.latlng.lng]) // a new marker is added to the map 
        .addTo(map)
        .bindPopup("Location Selected") // with the popup location selected
        .openPopup()

      // reverse geocoding to get the address of the selected point from nominatim map api
      const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&addressdetails=1`;

      try {
        const response = await fetch(reverseGeocodeUrl);
        const data = await response.json() // 
        if (data && data.display_name) { // checking if display name property of data and data is available
          setQuery(data.display_name); 
        } else {
          setQuery("Address not found"); 
        }
      } catch (error) { 
        console.error("Error with reverse geocoding:", error)
        setQuery("Error retrieving address"); 
      }
    })
  }, [map]) //everytime the map changes with .addTo(map), run this code

  const searchPlace = async (place) => { 
    try {
      const sriLankaBoundingBox = "79.6954,5.8754,81.8816,9.8354"; //making a sri lanka bounding box so that search results relevant to sri lanka will only appear

      const response = await fetch( //making the api call with the place given by user (inside sl box of course)
        `https://nominatim.openstreetmap.org/search?format=json&q=${place}&viewbox=${sriLankaBoundingBox}&bounded=1`
      );
      const data = await response.json(); 
      setSearchResults(data); //updating the search results through the setter
    } catch (error) { 
      console.error("Error searching for place:", error);
    }
  };

  const getCurrentLocation = () => { 
    if (navigator.geolocation) { //accessing the geolocation of the global object, navigator
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords; // destructing and getting the latitude and longitude values
          if (markerRef.current) {
            map.removeLayer(markerRef.current); 
          }
          map.setView([latitude, longitude], 13); // zooms in to the picked current location 

          markerRef.current = L.marker([latitude, longitude]) // updating the markerRef with a new marker 
            .addTo(map) 
            .bindPopup("Current Location Selected") 
            .openPopup();

          setLat(latitude); // setting the lat and long values
          setLng(longitude)
          setQuery("Current Location"); // Update search bar with "Current Location" as the address
          setShowCurrentLocation(false) // current location picking option disappears after selecting the option
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Error getting current location.")
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

   const handleSearchChange = async (e) => { 
    const value = e.target.value; //targets the value typed by the user
    setQuery(value) 
    if (value.length <= 3) { // if user has only entered 3 or less characters of the place (too short)
      setShowCurrentLocation(true) //current location picking option is made visible
      setSearchResults([]); //search result array is emptied 
    } else { 
      setShowCurrentLocation(false) // getting rid of current location picking option 
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

    fetch("/createevent", { // fetching the backend api endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body,
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

          const popupContent = `
          <div style="text-align:center;">
            <h3 style="color:#007bff;">${title}</h3>
            <p>${body}</p>
            <p>Date: ${date}</p>
            <p>Time: ${time}</p>
          </div>
        `; 
          L.marker([lat, lng]).addTo(map).bindPopup(popupContent).openPopup();  //using values still stored in state instead of fetching from database again

          setTitle("")
          setBody("")
          setLat("")
          setLng("")
          setDate("")
          setTime("")
          setQuery("")
          setSearchResults("")
          showCurrentLocation(false) //after that all states are set back to null
          markerRef.current = null
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
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)} 
        />
        
      <input 
        type="text"
        value={query}
        placeholder="Search for a place or pick from map" 
        onFocus={() => setShowCurrentLocation(true)} // make the current location picking option visible
        onChange={handleSearchChange} // and with every letter user types we call the handleSearchChange function 
      />
      {showCurrentLocation && ( // so if handleSearchChange made showCurrentLocation state true 
        <ul style={{ listStyle: "none", padding: 0 }}> 
          <li
            onClick={getCurrentLocation}// a clickable list item that will call the getCurrentLocation function
            style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }}
          >
            Pick Current Location
          </li>
        </ul>
      )}
      {searchResults.length > 0 && ( // else if there's an element in searchResult array 
        <ul style={{ listStyle: "none", padding: 0 }}>
          {searchResults.map((result, index) => ( // listing search results
            <li
              key={index}
              onClick={() => { // with clickable list items
                const { lat, lon } = result; // gets the lat and lon of each result of the array
                if (markerRef.current) {
                  map.removeLayer(markerRef.current); //remove previous marker value
                }
                map.setView([lat, lon], 13); // set view to the new position
                setLat(lat)
                setLng(lon)
      
                markerRef.current = L.marker([lat, lon]) // locates a new marker on that position
                  .addTo(map)
                  .bindPopup("Location Selected")
                  .openPopup();
                setQuery(result.display_name); // update search bar with selected place/adresss
                setSearchResults([]); // clear search results
              }}
              style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }}
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}
        <button onClick={postDetails}>Post Event</button>
      </div>
    </div>
  );
};

export default AddEvent;
