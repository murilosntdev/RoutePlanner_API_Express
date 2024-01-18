import Router from "express";
import { newCompany } from "../controllers/account.controller.js";

const accountRouter = Router();

accountRouter.post('/newCompany', newCompany);

export default accountRouter;