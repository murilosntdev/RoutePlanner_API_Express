import Router from "express";
import { newCompany } from "../controllers/account.controller.js";
import { validateNewCompanyInput, checkNewCompanyPreviousConditions } from "../middlewares/account.middlewares.js";

const accountRouter = Router();

accountRouter.post('/newCompany', validateNewCompanyInput, checkNewCompanyPreviousConditions, newCompany);

export default accountRouter;