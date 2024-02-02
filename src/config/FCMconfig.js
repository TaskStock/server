const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccount = require("../../taskstock-4a845-firebase-adminsdk-pvsc7-79f6c15f97.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;

