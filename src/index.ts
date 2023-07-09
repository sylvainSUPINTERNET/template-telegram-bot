import 'module-alias/register';
import 'dotenv/config';

import morgan from 'morgan';
import express, { Express } from 'express';

import webHookRouter from '@controllers/webhook.controller';
import TelegramBot from 'node-telegram-bot-api';

const PORT = process.env.PORT || 3000;


const app: Express = express();
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.use(`/webhook`, webHookRouter);


app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);


    if ( process.env.BOT_TOKEN === undefined || process.env.BOT_TOKEN === '' ) {
        throw new Error('BOT_TOKEN is not defined in .env file');
    }

    const bot = new TelegramBot(process.env.BOT_TOKEN, {webHook:true});
    bot.setWebHook(`${process.env.SERVER_URL}/webhook/${process.env.BOT_TOKEN}`);

    bot.on('message', (msg) => {
        console.log("received message");
        bot.sendMessage(msg.chat.id, 'Received your message');
    });
    
});