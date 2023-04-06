import {Request, Response} from 'express';
import StatusCodes from 'http-status-codes';
const {INTERNAL_SERVER_ERROR, BAD_REQUEST, UNPROCESSABLE_ENTITY, OK, UNAUTHORIZED} = StatusCodes;
import userRepo from "@repos/user-repo";
import {failure, success} from "@shared/response";
import ErrorMessage from "@shared/errorMessage";
import Validator from 'validatorjs';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import envVars from "@shared/env-vars";
import {IUser} from "../../types/Controller/Auth";
import securityRepo from "@repos/security-repo";
import moment from "moment";
import {ISecurity} from "@models/Security";
import mailer from "@util/mailer";
import template from "@views/emails/reset-password.email"
const message = ErrorMessage.CREDENTIALS_DID_NOT_MATCH;

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const {name, email, phone, password} = req.body;
      let validation = new Validator(req.body, {
        name: 'required',
        email: 'required|email',
        password: 'required|min:8'
      });
      if (validation.fails()) {
        return res
          .status(BAD_REQUEST)
          .send(failure(
            {message: ErrorMessage.HTTP_BAD_REQUEST, errors: validation.errors.errors}
          ));
      }
      if (await userRepo.existByEmail(email)) {
        return res
          .status(UNPROCESSABLE_ENTITY)
          .send(failure(
            {
              message: ErrorMessage.HTTP_BAD_REQUEST,
              errors: {
                email: "User already exist with this email address. Please try again with another email address. Thanks."
              }
            }
          ));
      }
      const created = await userRepo.add({name, email, phone, password});
      if (created)
        return res
          .status(OK)
          .send(success(ErrorMessage.HTTP_OK, req.body));
      else
        return res
          .status(UNPROCESSABLE_ENTITY)
          .send(success(ErrorMessage.HTTP_UNPROCESSABLE_ENTITY, req.body));
    } catch (err) {
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send(failure(
          {message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, errors: err}
        ));
    }
  }

  async login(req: Request, res: Response) {
    try {
      const {email} = req.body;
      let validation = new Validator(req.body, {
        email: 'required|email',
        password: 'required|min:8'
      });
      if (validation.fails()) {
        return res
          .status(BAD_REQUEST)
          .send(failure(
            {message: ErrorMessage.HTTP_BAD_REQUEST, errors: validation.errors.errors}
          ));
      }
      const user = await userRepo.getByEmail(email);
      if (!user) {
        return res.status(OK).send(failure({message, errors: {}}));
      }
      if(user.accountStatus !== 'Active'){
        return res
          .status(UNAUTHORIZED)
          .send(failure({
            message: "Account is not active.",
            errors: {}
          }));
      }
      const isMatch = bcrypt.compareSync(req.body.password, user.password);
      if (!isMatch) {
        return res.status(OK).send(failure({message, errors: {}}));
      }
      const token = jwt.sign({email: user.email?.toString(), name: user.name, role: user.role}, envVars.jwt.secret, {
        expiresIn: envVars.jwt.exp
      });
      const data:IUser = {
        id: user._id,
        name: user.name,
        email: user.email?.toString(),
        phone: user.phone,
        role: user.role,
        status: user.status,
        accountStatus: user.accountStatus
      }
      const refreshToken = jwt.sign(data, envVars.jwt.secret, {
        expiresIn: envVars.jwt.refExp
      });
      if(await securityRepo.existByEmail(email)){
        await securityRepo.delete(email);
      }
      const now = moment(new Date()); //today's date
      const expires = moment(now,'DD-MM-YYYY').add(...envVars.jwt.refExp.split(' '));
      await securityRepo.add({
        user_email: user.email,
        access_token: token,
        refresh_token: refreshToken,
        refresh_token_expires_at: expires.toString()
      });
      return res
        .status(OK)
        .send(
          success(
            'User logged in successfully',
            {
              user: data,
              accessToken: token,
              refreshToken: refreshToken
            })
        );
    } catch (err) {
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send(failure(
          {message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, errors: err}
        ));
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const {token} = req.body;
      let validation = new Validator(req.body, {
        token: 'required'
      });
      if (validation.fails()) {
        return res
          .status(BAD_REQUEST)
          .send(failure(
            {message: ErrorMessage.HTTP_BAD_REQUEST, errors: validation.errors.errors}
          ));
      }
      const decoded:any = jwt.verify(token, envVars.jwt.secret);
      const loginInfo:ISecurity|null = await securityRepo.getByEmail(decoded.email);
      if(!loginInfo){
        return res
          .status(UNAUTHORIZED)
          .send(failure({
            message: "No prior login information found.",
            errors: {}
          }));
      }
      if(loginInfo.refresh_token !== token){
        return res
          .status(UNAUTHORIZED)
          .send(failure({
            message: "Refresh token is not trustable.",
            errors: {}
          }));
      }
      const now = moment(new Date());
      const exp = moment(loginInfo.refresh_token_expires_at);
      if(now > exp){
        return res
          .status(UNAUTHORIZED)
          .send(failure({
            message: "Refresh token expired.",
            errors: {}
          }));
      }
      if(decoded.accountStatus !== 'Active'){
        return res
          .status(UNAUTHORIZED)
          .send(failure({
            message: "Account is not active.",
            errors: {}
          }));
      }
      const newToken = jwt.sign({email: decoded.email?.toString(), name: decoded.name, role: decoded.role}, envVars.jwt.secret, {
        expiresIn: envVars.jwt.exp
      });
      await securityRepo.updateByEmail(decoded.email,{
        access_token: newToken
      });
      return res.status(OK).send(success(ErrorMessage.HTTP_OK,{token: newToken}));
    } catch (err) {
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send(failure(
          {message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, errors: err}
        ));
    }
  }

  async logout(req: Request, res: Response){
    try {
      const loginInfo:ISecurity|null = await securityRepo.getByEmail(req.token?.email);
      if(!loginInfo){
        return res
          .status(UNAUTHORIZED)
          .send(failure({
            message: "No prior login information found.",
            errors: {}
          }));
      }
      await securityRepo.delete(req.token?.email);
      return res
        .status(OK)
        .send(success('Logged out successfully', {}));
    } catch (err) {
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send(failure(
          {message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, errors: err}
        ));
    }
  }

  async resetPasswordEmail(req: Request, res: Response) {
    try {
      const {email} = req.body;
      let validation = new Validator(req.body, {
        email: 'required|email'
      });
      if (validation.fails()) {
        return res
          .status(BAD_REQUEST)
          .send(failure(
            {message: ErrorMessage.HTTP_BAD_REQUEST, errors: validation.errors.errors}
          ));
      }
      const user = await userRepo.getByEmail(email);
      if (!user) {
        return res.status(OK).send(failure({message, errors: {}}));
      }
      const subject = "Reset password";
      const data = jwt.sign({email},envVars.jwt.secret,{expiresIn: "10 minutes"});
      const link = `${req.protocol}://${req.get('host')}${req.baseUrl}/reset/${data}`;
      const html = template(link);
      await mailer.mail(email, subject, html);
      return res.status(OK).send(success("Message delivered",{}));
    } catch (err) {
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send(failure(
          {message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, errors: err}
        ));
    }
  }

  async reset(req: Request, res: Response) {
    try {
      const {token,email,password,password_confirmation} = req.body;
      let validation = new Validator(req.body, {
        token: 'required',
        email: 'required|email',
        password: 'required|min:8|confirmed'
      });
      if (validation.fails()) {
        return res
          .status(BAD_REQUEST)
          .send(failure(
            {message: ErrorMessage.HTTP_BAD_REQUEST, errors: validation.errors.errors}
          ));
      }
      const decoded:any = jwt.verify(token, envVars.jwt.secret);
      if(decoded.email !== email){
        return res
          .status(BAD_REQUEST)
          .send(failure(
            {message: message, errors: {message}}
          ));
      }
      const user = await userRepo.getByEmail(email);
      if (!user) {
        return res.status(OK).send(failure({message, errors: {}}));
      }
      if(user.accountStatus !== 'Active'){
        return res
          .status(UNAUTHORIZED)
          .send(failure({
            message: "Account is not active.",
            errors: {}
          }));
      }
      const isMatch = bcrypt.compareSync(req.body.password, user.password);
      if (isMatch) {
        const message = "You can not set old password as new password";
        return res.status(OK).send(failure({message, errors: {message}}));
      }
      await userRepo.updatePassword(password,email);
      return res.status(OK).send(success("Password reset successful.",{}));
    } catch (err) {
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send(failure(
          {message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, errors: err}
        ));
    }
  }
}

export default new AuthController();