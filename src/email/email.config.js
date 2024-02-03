import hbs from "nodemailer-express-handlebars";
import path from "path";
import * as dotenv from "dotenv";
import * as nodemailer from "nodemailer";

dotenv.config();

export const smtp = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: process.env.NODEMAILER_SECURE,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    }
});

const handleBarsOptions = {
    viewEngine: {
        extName: ".html",
        partialsDir: path.resolve('./src/views'),
        defaultLayout: false
    },
    viewPath: path.resolve('./src/views'),
    extName: ".handlebars"
}

smtp.use('compile', hbs(handleBarsOptions));