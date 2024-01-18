import Router from "express";
import { newCompany } from "../controllers/account.controller.js";
import { validateNewCompanyInput } from "../middlewares/account.middlewares.js";

const accountRouter = Router();

accountRouter.post('/newCompany', validateNewCompanyInput, newCompany);

export default accountRouter;