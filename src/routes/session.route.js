import Router from "express";
import { login, logout, preLogin, refreshToken } from "../controllers/session.controller.js";
import { validatePreLoginInput, checkPreLoginPreviousConditions, validateLoginInput, checkLoginPreviousConditions, validateRefreshTokenInput, checkRefreshTokenPreviousConditions, authLogout, validateLogoutInput } from "../middlewares/session.middlewares.js";

const sessionRouter = Router();

sessionRouter.post('/preLogin', validatePreLoginInput, checkPreLoginPreviousConditions, preLogin);
sessionRouter.post('/login', validateLoginInput, checkLoginPreviousConditions, login);
sessionRouter.post('/refreshToken', validateRefreshTokenInput, checkRefreshTokenPreviousConditions, refreshToken);
sessionRouter.post('/logout', validateLogoutInput, authLogout, logout);

export default sessionRouter;