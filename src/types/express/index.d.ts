import 'express';


// **** Declaration Merging **** //

declare module 'express' {

  export interface Request {
    token?: any;
  }
}
