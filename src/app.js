import compression from "compression";
import cors from "cors";
import express from "express";
import * as dotenv from "dotenv";
import accountRouter from "./routes/account.route.js";

dotenv.config();

const port = process.env.EXPRESS_PORT;
const app = express();

app.use(compression());
app.use(express.json());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN
    })
);

app.use("/account", accountRouter);

app.listen(port, () => console.log("API Running..."));