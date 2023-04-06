import {IReq} from '@shared/types';
import {Response} from "express";
import StatusCodes from 'http-status-codes';
//To upload file to aws s3 bucket bellow code will be used
// import {initBucket, uploadToS3} from "@util/s3-uploader";
const {OK, INTERNAL_SERVER_ERROR, BAD_REQUEST} = StatusCodes;
import {success, failure} from "@shared/response";
import ErrorMessage from "@shared/errorMessage";
import {IFile, IKey} from "@shared/types";
import {_getKeyPair, _getRandomInt} from "@shared/functions";
import fileService from "@services/file-service";


class UploadController {
  async upload(req: IReq, res: Response) {
    try {
      //Check if file exist in request if not then send failure message
      if (!req.files || !req.files.length) {
        return res
          .status(BAD_REQUEST)
          .send(failure({message : BAD_REQUEST, errors : {msg: ErrorMessage.HTTP_BAD_REQUEST}}));
      }
      //If multiple file were uploaded put all names on one array
      const fileNames: string[] = [];
      const files = req.files as IFile[];
      files.map((file) => {
        fileNames.push(file.filename);
      });
      const keyPair:IKey = await _getKeyPair(`meldcX${_getRandomInt()}`);
      //Save the file info to local database
      await fileService.addOne({names: fileNames, ...keyPair,lastAccessed: new Date().toDateString()});
      return res
        .status(OK)
        .send(success(ErrorMessage.HTTP_OK, keyPair));
    } catch (err) {
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send(failure({message : ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, errors : err}));
    }
  }
}

export default new UploadController();