import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState, useEffect, useRef } from "react";
import M from "materialize-css";

const AddEvent = ({ map }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [date, setDate] = useState(""); // State for date
  const [time, setTime] = useState(""); // State for time
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    map.on("click", function (e) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      setLat(e.latlng.lat);
      setLng(e.latlng.lng);

      markerRef.current = L.marker([e.latlng.lat, e.latlng.lng])
        .addTo(map)
        .bindPopup("Location Selected")
        .openPopup();
    });
  }, [map]);

  const searchPlace = (place) => {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${place}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const { lat, lon } = data[0];
          const position = [lat, lon];
          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }
          map.setView(position, 13);

          markerRef.current = L.marker(position)
            .addTo(map)
            .bindPopup("Location Selected")
            .openPopup();

          setLat(lat);
          setLng(lon);
        } else {
          alert("Place not found.");
        }
      });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }
          map.setView([latitude, longitude], 13);

          markerRef.current = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup("Current Location Selected")
            .openPopup();

          setLat(latitude);
          setLng(longitude);
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

  const postDetails = () => {
    if (!title || !body || !lat || !lng || !date || !time) {
      M.toast({ html: "Please fill in all fields", classes: "red darken-2" });
      return;
    }

    // Combine date and time into a single DateTime string
    const dateTime = `${date}T${time}`;

    fetch("/createevent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body,
        lat,
        lng,
        dateTime, // Add combined dateTime to payload
      }),
    })
      .then((res) => res.json())
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

          L.marker([lat, lng]).addTo(map).bindPopup(popupContent).openPopup();

          setTitle("");
          setBody("");
          setLat("");
          setLng("");
          setDate("");
          setTime("");
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
        <button onClick={getCurrentLocation}>Pick Current Location</button>
        <input
          type="text"
          placeholder="Search for a place or pick from map"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchPlace(e.target.value);
            }
          }}
        />
        <button onClick={postDetails}>Post Event</button>
      </div>
    </div>
  );
};

export default AddEvent;
