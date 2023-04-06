import multer from "multer";
import path from "path";
import envVars from "@shared/env-vars";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //Directory of files to upload
    const dir = path.join(__dirname, '../', envVars.folder);
    //Check if directory exist, if not then create
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = file.originalname
      .split('.')
      .filter(Boolean)
      .slice(1)
      .join('.');
    const uniqueSuffix = Date.now().toString()
      + '-'
      + Math.round(Math.random() * 1E9).toString()
      + '.'
      + ext;
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});
const upload = multer({storage});

export default upload;