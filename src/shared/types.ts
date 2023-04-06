import * as e from 'express';
import {Query} from 'express-serve-static-core';


// **** Express **** //

export interface IReq<T = void> extends e.Request {
  body: T;
}

export interface IReqQuery<T extends Query, U = void> extends e.Request {
  query: T;
  body: U;
}

export interface IFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  filename: string;
  size: number;
}

export interface IKey {
  publicKey: string;
  privateKey: string;
}