import fs from "fs";
import admin from "firebase-admin";
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import './models/event.js';  // Import the model for side effects
import eventRoutes from './routes/event.js';  // Import the router

const app = express();
const PORT = 5000;



// firebase credentials are initialized
const creditKey = JSON.parse(
    fs.readFileSync('./authkey.json')
);
admin.initializeApp({
    credential: admin.credential.cert(creditKey),
});
app.use(async(req,res,next)=>{
    const {authToken} = req.headers; // authtoken is loaded with the user's token
    if(authToken){
        try{
            req.user = await admin.auth().verifyIdToken(authToken); // this verifies whether the user's token actually exists in the firebase data
        }catch (e) {
            console.log(e.message);
            return res.sendStatus(404);
        }
        req.user = req.user || {}; // if it does req.user loads the user
        next(); // this ensures it moves to the next middleware
    }
})

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON requests

// MongoDB Connection
mongoose.connect("mongodb+srv://sehansiperera567:techspirit@cluster0.yplf9.mongodb.net/data");

mongoose.connection.on('connected', () => {
    console.log('connected to mongo yeahhh');
});

mongoose.connection.on('error', (err) => {
    console.log('error connecting', err);
});

// Models and Routes
app.use(eventRoutes);


// Start the Express app
const server = app.listen(PORT, () => {
    console.log('Server is running on', PORT);
});
