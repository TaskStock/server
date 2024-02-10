const multer = require('multer');
const {Storage} = require('@google-cloud/storage');
require('dotenv').config();

// Google Cloud Storage를 위한 설정
const storage = new Storage({
    keyFilename: process.env.GCP_KEY_FILENAME,
    projectId: process.env.GCP_PROJECT_ID,
});
const bucket = storage.bucket(process.env.GCS_BUCKET);

const fileFilter = (req, file, cb) => {
    // 허용되는 파일 형식
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true); // 허용되는 파일 형식
    } else {
        let err = new Error();
        err.code = 'LIMIT_FILE_TYPE';
        cb(err, false); // 허용되지 않는 파일 형식
    }
};

const errorHandler = (err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(200).json({
            message: "파일 크기는 5MB를 넘을 수 없습니다.",
            result: "limitFileSize"
        });
    } else if (err.code === 'LIMIT_FILE_TYPE') {
        return res.status(200).json({
            message: "이미지 파일만 업로드 가능합니다.",
            result: "limitFileType"
        });
    } else {
        next(err);
    }    
};




const uploader = multer({ 
    storage: multer.memoryStorage(),
    limits: {filesize: 5 * 1024 * 1024}, // 5MB 제한
    fileFilter: fileFilter
});

module.exports = {uploader, bucket, errorHandler};


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/profile')
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + '-' + file.originalname)
//     }
// });

