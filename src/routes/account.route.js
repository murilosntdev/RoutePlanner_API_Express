import Router from "express";
import { activate, newCompany } from "../controllers/account.controller.js";
import { validateNewCompanyInput, checkNewCompanyPreviousConditions, validateActivateInput, checkActivatePreviousConditions } from "../middlewares/account.middlewares.js";

const accountRouter = Router();

accountRouter.post('/newCompany', validateNewCompanyInput, checkNewCompanyPreviousConditions, newCompany);
accountRouter.post('/activate', validateActivateInput, checkActivatePreviousConditions, activate);

export default accountRouter;