import {IReq} from '@shared/types';
import StatusCodes from 'http-status-codes';
import {Response} from "express";
const {OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, NO_CONTENT} = StatusCodes;
import {success, failure} from "@shared/response";
import ErrorMessage from "@shared/errorMessage";
import fileService from "@services/file-service";
import fileRepo from "@repos/file-repo";
import path from "path";
import envVars from "@shared/env-vars";
import fs from "fs";
import moment from 'moment';
import {IFile} from "@models/file-model";

class DeleteController {
  async deleteFile(req: IReq, res: Response) {
    try {
      const {privateKey} = req.params;
      const file = await fileRepo.getByPrivateKey(privateKey);
      if (!file) {
        return res.status(BAD_REQUEST).send(failure(
          {message: ErrorMessage.HTTP_BAD_REQUEST, errors: ''}
        ));
      }
      if (file.names.length < 1) {
        return res.status(NO_CONTENT).send(failure(
          {message: "No file found.", errors: ''}
        ));
      }
      const files: string[] = file.names;
      try {
        await fileService.delete(privateKey);
      } catch (err) {
        return res.status(INTERNAL_SERVER_ERROR).send(failure(
          {message: "File could not be deleted", errors: err}
        ));
      }
      for (let i = 0; i < files.length; i++) {
        const filePath = path.join(__dirname, '../', envVars.folder, files[i]);
        fs.unlinkSync(filePath);
      }
      return res.status(OK).send(success(ErrorMessage.HTTP_OK, {status: OK}));
    } catch (err) {
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send(failure(
          {message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, errors: err}
        ));
    }
  }

  //Schedule delete
  async deleteScheduler(){
    try {
      const allFiles = await fileRepo.getAll();
      for (let i=0;i<allFiles.length;i++){
        if(allFiles[i].lastAccessed){
          const now = moment(new Date()); //today's date
          const end = moment(allFiles[i].lastAccessed); // last accessed date
          const duration = moment.duration(now.diff(end));
          if(duration.asDays()>7 && allFiles[i].names.length>=1){
            const files: IFile = allFiles[i];
            try {
              await fileService.delete(files.privateKey);
              for (let i = 0; i < files.names.length; i++) {
                const filePath = path.join(__dirname, '../', envVars.folder, files.names[i]);
                fs.unlinkSync(filePath);
              }
            } catch (err) {
             console.log(err);
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
}

export default new DeleteController();