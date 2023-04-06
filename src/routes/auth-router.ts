import {Router} from 'express';
import AuthController from "@controller/auth/AuthController";
import {auth} from "@util/auth";
// **** Variables **** //

// Misc
const router = Router();

// Paths
export const p = {
  basePath: '/auth',
  login: '/login',
  register: '/register',
  resetPasswordEmail: '/reset/email',
  resetPassword: '/reset',
  logout: '/logout',
  refreshToken: '/refresh-token',
} as const;


// **** Routes **** //
//Register a user
router.post(p.register, AuthController.register);
router.post(p.login, AuthController.login);
router.post(p.refreshToken, AuthController.refreshToken);
router.post(p.logout, auth, AuthController.logout);
router.post(p.resetPasswordEmail, AuthController.resetPasswordEmail);
router.post(p.resetPassword, AuthController.reset);

// **** Export default **** //

export default router;