const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Event = mongoose.model("Event");

router.post("/createevent", (req, res) => {
    const { title, body, lat, lng, dateTime } = req.body;
  
    // Validate the input
    if (!title || !body || !lat || !lng || !dateTime) {
      return res.status(422).json({ error: "Please add all the fields" });
    }
  
    // Create a new event with the dateTime field
    const event = new Event({
      title,
      body,
      lat,
      lng,
      dateTime: new Date(dateTime), // Convert dateTime to a Date object
    });
  
    event
      .save()
      .then((result) => {
        console.log(result);
        res.json({ post: result });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: "Server error" });
      });
  });
  

router.get("/allevents", (req, res) => {
  Event.find()
    .then((events) => {
      res.json({ events: events });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
