import fs from "fs";
import admin from 'firebase-admin';

function Authentication(){
    // Authenticating through Firebase
    const creditKey = JSON.parse(fs.readFileSync('./authkey.json'));
    admin.initializeApp({credential: admin.credential.cert(creditKey)})
}
export default Authentication();


