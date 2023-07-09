import 'module-alias/register';
import 'dotenv/config';

import fs from 'fs';
import path from 'path';

import morgan from 'morgan';
import express, { Express } from 'express';

import webHookRouter from '@controllers/webhook.controller';
import TelegramBot from 'node-telegram-bot-api';

export let bot: TelegramBot | null = null;



const app: Express = express();
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.use(`/webhook`, webHookRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);


    if ( process.env.BOT_TOKEN === undefined || process.env.BOT_TOKEN === '' ) {
        throw new Error('BOT_TOKEN is not defined in .env file');
    }

    // Setup Telegram bot & webhook
    // => Note : useless to use bot.on('message' ...) since we setup webhook approch, not polling for better performance
    bot = new TelegramBot(process.env.BOT_TOKEN, {webHook:true});

    // send request to telegram to setup webhook for this server
    bot.setWebHook(`${process.env.SERVER_URL}/webhook/${process.env.BOT_TOKEN}`);



    console.log("Starting loop for cleaning files every 5 mins ...");
    // Basic loop that clean file uploaded by users every 5 mins
    const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;
    const DIRECTORY_PATH = './uploaded'; // Replace with the directory you want to monitor
    
    setInterval(() => {

      console.log("Cleaning .ogg files ...");
      fs.readdir(DIRECTORY_PATH, (err, files) => {
        if (err) {
          console.log('Error reading directory:', err);
          return;
        }
    
        files.forEach((file) => {
          const filePath = path.join(DIRECTORY_PATH, file);
          const fileTimestamp = parseInt(file.split('_')[0]); // Extract the timestamp from the filename
          
          const currentTime = Date.now();
          const timeDiff = currentTime - fileTimestamp;
    
          if (timeDiff > FIVE_MINUTES_IN_MS) {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.log('Error deleting file:', err);
                return;
              }
              console.log(`Deleted file ${filePath}`);
            });
          }
        });
      });
    }, FIVE_MINUTES_IN_MS);

});