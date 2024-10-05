import express from 'express';
import mongoose from "mongoose";

const router = express.Router();

const Event = mongoose.model("Event");

router.post("/createevent", (req, res) => {
    const { title, body, address, lat, lng, dateTime } = req.body;
    const {uid} = req.user;
    if(uid){
        // Validate the input
        if (!title || !body || !lat || !lng || !dateTime) {
            return res.status(422).json({ error: "Please add all the fields" });
        }

        // Create a new event with the dateTime field
        const event = new Event({
            title,
            body,
            address,
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
    }else{
        res.status(204).json({error:"user not recognized"})
    }

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

// module.exports = router;

export default  router;