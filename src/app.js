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

app.get("/", (req, res) => {
    res.status(200);
    res.json({
        status: 200,
        message: "Bem-vindo à RoutePlanner API Express",
        details: {
            version: process.env.API_VERSION,
            operating_status: "online",
            links: {
                documentation: "https://github.com/murilosntdev/RoutePlanner_API_Express"
            }
        }
    })
})

app.use("/account", accountRouter);

app.use((req, res) => {
    const statusCode = 404;
    const message = "Rota Não Encontrada";
    res.status(statusCode);
    res.json({
        error: {
            status: statusCode,
            message: message
        }
    });
});

app.listen(port, () => console.log("API Running..."));