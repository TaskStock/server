const multer = require('multer');
const {Storage} = require('@google-cloud/storage');
require('dotenv').config();

// Google Cloud Storage를 위한 설정
const storage = new Storage({
    keyFilename: process.env.GCP_KEY_FILENAME,
    projectId: process.env.GCP_PROJECT_ID,
});
const bucket = storage.bucket(process.env.GCS_BUCKET);


const uploader = multer({ storage: multer.memoryStorage() });

module.exports = {uploader, bucket};


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/profile')
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + '-' + file.originalname)
//     }
// });

