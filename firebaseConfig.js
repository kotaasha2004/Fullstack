// firebaseConfig.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseConfig.json'); // Replace with your JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://final2-acbd1-default-rtdb.firebaseio.com" // Replace with your Firebase project URL
});

const db = admin.firestore();

module.exports = db;
