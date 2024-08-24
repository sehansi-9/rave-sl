const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
  },
});

mongoose.model("Event", eventSchema);
