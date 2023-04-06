import StatusCodes from 'http-status-codes';

const {INTERNAL_SERVER_ERROR, BAD_REQUEST, NO_CONTENT} = StatusCodes;
import {Request, Response} from 'express';
import path from "path";
import fileRepo from "@repos/file-repo";
import {failure} from "@shared/response";
import ErrorMessage from "@shared/errorMessage";
import envVars from "@shared/env-vars";

class DownloadController {
  async download(req: Request, res: Response) {
    try {
      const {publicKey} = req.params;
      const file = await fileRepo.getByPublicKey(publicKey);
      if (!file) {
        return res
          .status(BAD_REQUEST)
          .send(failure(
            {message : ErrorMessage.HTTP_BAD_REQUEST, errors : ''}
          ));
      }
      if (file.names.length < 1) {
        return res
          .status(NO_CONTENT)
          .send(failure(
            {message : "No file found.", errors : ''}
          ));
      }
      await fileRepo.update(file);
      const files: string[] = file.names;
      if (files.length === 1) {
        const filePath: string = path.join(__dirname, '../', envVars.folder, files[0]);
        return res.download(filePath);
      } else {
        const filePaths: string[] = [];
        files.map(file => {
          filePaths.push(path.join(__dirname, '../', envVars.folder, file));
        });
        //All file can be zip into one and send on response for download
        const zipFilePath = "";
        return res.download(zipFilePath);
      }
    } catch (err) {
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send(failure(
          {message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, errors: err}
        ));
    }
  }
}

export default new DownloadController();