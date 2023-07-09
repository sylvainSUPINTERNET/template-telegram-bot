import { extractMessage } from '@services/telegramBot.service';
import { logger } from '@utils/logger';
import { Router, Response, Request, NextFunction } from 'express';

const webHookRouter: Router = Router();

webHookRouter.post('/:bot_token', async (req: Request, res: Response, _next:NextFunction) => {

    try {
        extractMessage(req.body);

        res.status(200).json({
            "hello":"salut"
        });
    } catch ( e ) {
        
        logger.error(`Error while processing telegram message / webhook : ${e}`);
        res.status(500).json({
            "error": `${e}`
        });

    }




});

export default webHookRouter;

