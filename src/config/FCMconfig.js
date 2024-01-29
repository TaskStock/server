const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccount = require("../../firebase-gcp-share-private-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;

