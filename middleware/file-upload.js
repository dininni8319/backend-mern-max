const multer = require("multer");
const { v4 } = require('uuid');

//tell us which type of file we are dealing with
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limits: 5000000,
  storage: multer.diskStorage({  //storage driver
    destination: (req, file, cb) => {
      cb(null, "upload/images") // we are going to tell to multer the file destination
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype] //get the extention 
      // cb(null, uuidv4 + "." + ext) //callback, generate the filename with extension
      cb(null, v4() + "." + ext)
    }
  }),
  fileFilter: (req, file, cb) => {
    // here we are checking is if the mime type exists
    //and turning the mime into a boolean
   const isValid = !!MIME_TYPE_MAP[file.mimetype]; 
   let error = isValid ? null : new Error("invalid mime type!");
   cb(error, isValid);
  }
});

module.exports = fileUpload;