import Router from "express";
import { preLogin } from "../controllers/session.controller.js";
import { validatePreLoginInput, checkPreLoginPreviousConditions } from "../middlewares/session.middlewares.js";

const sessionRouter = Router();

sessionRouter.post('/preLogin', validatePreLoginInput, checkPreLoginPreviousConditions, preLogin);

export default sessionRouter;