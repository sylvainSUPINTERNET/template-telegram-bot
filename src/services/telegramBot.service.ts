import { logger } from "@utils/logger";
import axios from "axios";
import { writeFile } from 'fs/promises'
import { v4 as uuidv4 } from 'uuid';
import speech from '@google-cloud/speech';
import { google } from "@google-cloud/speech/build/protos/protos";

/**
 * Support voice & text message
 * Video / photos / audio not supported for the moment.
 * @param telegramMsg 
 */
export const extractMessage = async ( telegramMsg:any ) => {
    // Note : file_path generated are valid for 1h


    const fileName = uuidv4();

    if ( telegramMsg["message"] ) {

        if ( telegramMsg["message"]["text"] ) {

            const { text } : {text:string} = telegramMsg["message"];
            console.log(text);
            return;
        }

        if ( telegramMsg["message"]["voice"] ) {
            
            // {
            //     duration: 0,
            //     mime_type: 'audio/ogg',
            //     file_id: 'AwACAgQAAxkBAAMYZKrW-Eved46q0p0lUj6tjnQkDdQAAj8SAAIN9FhRzQPQRcULj7gvBA',
            //     file_unique_id: 'AgADPxIAAg30WFE',
            //     file_size: 4332
            //   }
            const { voice } : {voice:any} = telegramMsg["message"];

            const {data} = await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${voice.file_id}`)
            const { file_path } : {file_path:string} = data.result;

            const {data:voiceBuffer} = await axios.get(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file_path}`, {responseType: 'arraybuffer'})

            await writeFile(`./uploaded/${new Date().getTime()}_${fileName}.ogg`, voiceBuffer);

            //https://cloud.google.com/speech-to-text?hl=fr
            //https://codelabs.developers.google.com/codelabs/cloud-speech-text-node#5

            const client = new speech.SpeechClient();
            const voiceUri = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file_path}`;
            
            const audio = {
                uri: voiceUri,
            };
 
            const request: google.cloud.speech.v1.IRecognizeRequest = {
                audio: audio,
                config: {
                    encoding: 'OGG_OPUS',
                    sampleRateHertz: 16000,
                    languageCode: 'fr-FR',
                }
            }

            const resp:any = await client.recognize(request);
            if ( resp && resp.results && resp.results.length > 0 ) { 

                const transcription = resp.results
                .map((result:any) => result.alternatives[0].transcript)
                .join('\n');

                console.log(`Transcription: ${transcription}`);
            }

            return;
        }

        throw new Error("Message type not supported yet ( expected voice or text )");
    }

    throw new Error("Message was not valid telegram message");
}
