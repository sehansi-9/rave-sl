const express = require('express');
const app = express();
const PORT = 5000;
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON requests

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on('connected', () => {
    console.log('connected to mongo yeahhh');
});

mongoose.connection.on('error', (err) => {
    console.log('error connecting', err);
});

// Models and Routes
require('./models/event'); 
app.use(require('./routes/event')); 


// Start the Express app
const server = app.listen(PORT, () => {
    console.log('Server is running on', PORT);
});
