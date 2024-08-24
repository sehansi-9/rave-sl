import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import AddEvent from "./screens/AddEvent";
import NavBar from "./Navbar";

const MapComponent = ({ setMap }) => {
  const [data, setData] = useState([]);

  const mapRef = useRef(null); // this is to make sure even if mounting and unmouthing happenes in useEffect that map is initialized only once
  useEffect(() => {
    if (mapRef.current) return; // if map is initialized or mapRef.current== yes and it holds something not null THEN exit
    //ELSE
    mapRef.current = L.map("map"); // initialize the map to the null element from L, leaflet

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      // tileLayer from openstreetmap
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current); // add the tile layer to current initialized map

    mapRef.current.locate({ setView: true, maxZoom: 13 }); //user's current location
    mapRef.current.on("locationfound", (e) => {
      L.marker(e.latlng)
        .addTo(mapRef.current)
        .bindPopup("You are here!")
        .openPopup();
    });

    setMap(mapRef.current);
  }, []); // Empty dependency array to ensure this runs only once

  useEffect(() => {
    fetch("/allevents", {
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

          const eventDate = new Date(dateTime);
          const date = eventDate.toLocaleDateString(); // Format as needed
          const time = eventDate.toLocaleTimeString();

          L.marker([lat, lng]).addTo(mapRef.current).bindPopup(`
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

  return <div id="map"></div>;
};

function App() {
  const [map, setMap] = useState(null); // in the main parent App we initialize useState, currently map is null
  return (
    <div>
      <NavBar></NavBar>
      <MapComponent setMap={setMap} />{" "}
      {/* When Mapcomponent is rendered setter method is sent as a prop to it to update map */}
      {map && <AddEvent map={map} />}{" "}
      {/*And if that map is loaded properly AND AddEvent component is rendered then that map is passed to AddEvent to add events */}
    </div>
  );
}

export default App;
