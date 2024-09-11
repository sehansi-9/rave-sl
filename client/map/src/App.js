import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import AddEvent from "./screens/AddEvent";
import FindEvent from "./screens/FindEvent";
import NavBar from "./Navbar";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

const MapComponent = ({ setMap }) => {

  const customIcon = L.icon({
    iconUrl: "https://png.pngtree.com/png-vector/20230617/ourmid/pngtree-you-are-here-location-pin-in-red-gradation-color-vector-png-image_7153745.png",  
    iconSize: [70, 70],        
         
  });
  
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
      L.marker(e.latlng, { icon: customIcon })
        .addTo(mapRef.current)
    });

    setMap(mapRef.current);
  }, []); // Empty dependency array to ensure this runs only once

  

  return <div id="map"></div>;
};


function App() {
  const [map, setMap] = useState(null); // in the main parent App we initialize useState, currently map is null
  return (
    <BrowserRouter>
    <NavBar />
    <Routes>
      <Route
        path="/find"
        element={<>
          <MapComponent setMap={setMap} />
          {map && <FindEvent map={map} />}
        </>}
      />
      <Route
        path="/create"
        element={
          <>
            <MapComponent setMap={setMap} />
            {map && <AddEvent map={map} />}
          </>
        }
      />
    </Routes>
  </BrowserRouter>
  );
}

export default App;
