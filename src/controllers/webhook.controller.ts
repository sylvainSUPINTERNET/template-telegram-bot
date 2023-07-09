import { logger } from '@utils/logger';
import { Router, Response, Request, NextFunction } from 'express';

const webHookRouter: Router = Router();

webHookRouter.post('/:bot_token', (req: Request, res: Response, _next:NextFunction) => {
    
    logger.info("Received Telegram webhook request", req.params.bot_token);
    console.log(req.body);
    res.status(200).json({
        "hello":"salut"
    })

});

export default webHookRouter;

