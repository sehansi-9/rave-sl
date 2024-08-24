import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

const FindEvent = ({ map, setMap }) => {
    const [data, setData] = useState([]);
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

          L.marker([lat, lng]).addTo(map).bindPopup(`
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

}
export default FindEvent;