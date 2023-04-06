import {Router} from 'express';
import authRouter, {p as authPaths} from "@routes/auth-router";


// Init
const apiRouter = Router();

// Add api routes
apiRouter.use(authPaths.basePath, authRouter);

// **** Export default **** //

export default apiRouter;
