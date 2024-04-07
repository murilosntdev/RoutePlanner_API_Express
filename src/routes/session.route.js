import Router from "express";
import { login, preLogin } from "../controllers/session.controller.js";
import { validatePreLoginInput, checkPreLoginPreviousConditions, validateLoginInput, checkLoginPreviousConditions } from "../middlewares/session.middlewares.js";

const sessionRouter = Router();

sessionRouter.post('/preLogin', validatePreLoginInput, checkPreLoginPreviousConditions, preLogin);
sessionRouter.post('/login', validateLoginInput, checkLoginPreviousConditions, login);

export default sessionRouter;