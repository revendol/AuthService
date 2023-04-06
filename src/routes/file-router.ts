import {Router} from 'express';
//Uploading configuration for file using multer
import uploader from "@util/local-uploader";
import UploadController from "../controllers/UploadController";
import DownloadController from "../controllers/DownloadController";
import DeleteController from "../controllers/DeleteController";

// **** Variables **** //

// Misc
const router = Router();

// Paths
export const p = {
  basePath: '/',
  uploadFiles: '/files',
  downloadExistingFiles: '/files/:publicKey',
  deleteExistingFiles: '/files/:privateKey',
} as const;


// **** Routes **** //

router.post(
  p.uploadFiles,
  uploader.array("files"),
  UploadController.upload
);

router.get(
  p.downloadExistingFiles,
  DownloadController.download
);

router.delete(
  p.deleteExistingFiles,
  DeleteController.deleteFile
);

// **** Export default **** //

export default router;